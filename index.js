const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());

morgan.token('body', (req) => {return req.method === 'POST' ? JSON.stringify(req.body) : ''});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.use(express.static('dist'));
// const corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));

app.use(cors());
 
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map(n => n.id)) : 0;
  return maxId + 1;
}
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
  });

  app.get('/info', (request, response) => {
    const people = persons.length;
    const firstMessage = `Phonebook has info for ${people} people`;
    const now = new Date();

    response.send(`<p>${firstMessage}</p>
                    <p>${now}</p>`);
  });

  app.get('/api/persons', (request, response) => {
    response.json(persons);
  });

  app.get('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id);
    if (isNaN(personId)) {
      response.status(400).json({error:'Invalid id'});
    } else {
      const person = persons.find(p => p.id === personId);
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({error: 'Person not found'});
      }
    }
  });

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    if (isNaN(id)) {
      response.status(400).json({error:'Invalid id'}).end();
    } else {
      const person = persons.find(p => p.id === id);
      if (person) {
        persons = persons.filter(p => p.id !== person.id);
        response.status(204).end();
      } else {
        response.status(404).json({error: 'Person not found'}).end();
      }
    }
  });

  app.post('/api/persons', (request, response) => {
    const body = request.body;
    
    if (!body.name || !body.number) {
      return response.status(400).json({error: 'name or number missing'}).end();
    }

    const nameExists = persons.some(p => p.name.toLowerCase().trim() === body.name.toLowerCase().trim());
    if (nameExists) {
      return response.status(409).json({error: 'name already exists'}).end();
    }

    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }
    
    persons = persons.concat(person);
    response.json(person);
  });

  const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
  }

  app.use(unknownEndpoint);

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});