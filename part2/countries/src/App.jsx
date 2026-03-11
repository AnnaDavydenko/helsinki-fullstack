import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryList from './components/CountryList'
import CountryDetails from './components/CountryDetails'

const App = () => {
  const [value, setValue] = useState('')
  const [countries, setCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  useEffect(() => {
    if (value) {
      const matches = countries.filter(c => 
        c.name.common.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredCountries(matches)
    } else {
      setFilteredCountries([])
    }
  }, [value, countries])

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  const handleShow = (name) => {
    setValue(name)
  }

  const renderContent = () => {
    if (filteredCountries.length > 10) {
      return <div>Too many matches, specify another filter</div>
    } else if (filteredCountries.length > 1) {
      return <CountryList countries={filteredCountries} onShow={handleShow} />
    } else if (filteredCountries.length === 1) {
      return <CountryDetails country={filteredCountries[0]} />
    }
    return null
  }

  return (
    <div>
      <form>
        find countries <input value={value} onChange={handleChange} />
      </form>
      {renderContent()}
    </div>
  )
}

export default App
