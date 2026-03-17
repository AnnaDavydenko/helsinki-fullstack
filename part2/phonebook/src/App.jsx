import { useState, useEffect } from 'react'
import personService from './services/persons'
import './index.css'

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  const className = type === 'error' ? 'error' : 'notification'

  return (
    <div className={className}>
      {message}
    </div>
  )
}

const Filter = ({ value, onChange }) => (
  <div>
    filter shown with <input value={value} onChange={onChange} />
  </div>
)

const PersonForm = ({ onSubmit, nameValue, onNameChange, numberValue, onNumberChange }) => (
  <form onSubmit={onSubmit}>
    <div>
      name: <input value={nameValue} onChange={onNameChange} />
    </div>
    <div>
      number: <input value={numberValue} onChange={onNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({ persons, deletePerson }) => (
  <div>
    {persons.map(person => 
      <Person key={person.id} person={person} deletePerson={() => deletePerson(person.id, person.name)} />
    )}
  </div>
)

const Person = ({ person, deletePerson }) => (
  <p>
    {person.name} {person.number} 
    <button onClick={deletePerson}>delete</button>
  </p>
)

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()
    
    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const changedPerson = { ...existingPerson, number: newNumber }
        
        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedPerson))
            setNewName('')
            setNewNumber('')
            setMessageType('success')
            setMessage(`Updated ${returnedPerson.name}'s number`)
            setTimeout(() => setMessage(null), 5000)
          })
          .catch(error => {
            setMessageType('error')
            setMessage(error.response.data.error)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
            setTimeout(() => setMessage(null), 5000)
          })
      }
      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setMessageType('success')
        setMessage(`Added ${returnedPerson.name}`)
        setTimeout(() => setMessage(null), 5000)
      })
      .catch(error => {
        setMessageType('error')
        setMessage(error.response.data.error)
        setTimeout(() => setMessage(null), 5000)
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
        .catch(error => {
          setMessageType('error')
          setMessage(`Information of ${name} has already been removed from server`)
          setPersons(persons.filter(p => p.id !== id))
          setTimeout(() => setMessage(null), 5000)
        })
    }
  }

  const personsToShow = filter.length === 0
    ? persons
    : persons.filter(person => 
        person.name.toLowerCase().includes(filter.toLowerCase())
      )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter value={filter} onChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm 
        onSubmit={addPerson}
        nameValue={newName}
        onNameChange={handleNameChange}
        numberValue={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
