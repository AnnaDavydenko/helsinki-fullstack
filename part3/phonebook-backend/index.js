require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    });
  }

  Person.find({ name: body.name }).then(result => {
    if (result.length > 0) {
      return response.status(400).json({
        error: 'name must be unique',
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save().then(savedPerson => {
      response.json(savedPerson);
    })
      .catch(error => next(error));
  });
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then(person => {
      response.status(204).end()
    })
    .catch(error => next(error));
});

app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then(persons => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`,
    );
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const body = request.body;

  Person.findById(id)
    .then(person => {
      if (!person) {
        return response.status(404).json({ error: 'person not found' });
      }

      person.name = body.name;
      person.number = body.number;

      return person.save().then(updatedPerson => {
        response.json(updatedPerson);
      })
    })
    .catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
