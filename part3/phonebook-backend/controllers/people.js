const peopleRouter = require('express').Router()
const Person = require('./../models/person')

peopleRouter.get('/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

peopleRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

peopleRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  Person.find({ name: body.name }).then(result => {
    if (result.length > 0) {
      return response.status(400).json({
        error: 'name must be unique',
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
      .catch(error => next(error))
  })
})

peopleRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

peopleRouter.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`,
    )
  })
})

peopleRouter.put('/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  Person.findById(id)
    .then(person => {
      if (!person) {
        return response.status(404).json({ error: 'person not found' })
      }

      person.name = body.name
      person.number = body.number

      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

module.exports = peopleRouter
