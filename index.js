require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
//const person = require('./models/person');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(express.static('dist'));
app.use(express.json());

morgan.token('body', (req) => {return req.method === 'POST' ? JSON.stringify(req.body) : '';});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


// const corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

app.use(cors());

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    const firstMessage = `Phonebook has info for ${persons.length} people`;
    const now = new Date();
    response.send(`<p>${firstMessage}</p><p>${now}</p>`);
  }).catch(error => next(error));
});

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons);
  }).catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  const personId = request.params.id;
  Person.findById(personId).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).json({error: 'Person not found'});
    }
  })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  if (request.params.id === undefined || request.params.id === null || !mongoose.Types.ObjectId.isValid(request.params.id)) {
    response.status(400).json({error:'Invalid id'}).end();
  }
  Person.findByIdAndDelete(request.params.id).then(result => {
    if (result) {
      response.set('X-Deleted-Resource', request.params.id);
      response.status(204).end();  
    }
  })
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body;

  Person.findOne({name}).then(existingPerson  => {
    if (existingPerson) {
      return response.status(409).json({error: 'name already exists'}).end();
    }

    const person = new Person({name, number});
    person.save().then(savedPerson => {
      response.json(savedPerson);
    }).catch(error => next(error));
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body;
  if (!name || !number) {
    return response.status(400).json({error: 'name or number missing'}).end();
  }
  const person = {name, number};
  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
    .then(updatePerson => {
      response.json(updatePerson);
    }).catch(error => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'});
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'});
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({error: error.message});
  }
  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});