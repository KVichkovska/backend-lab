import 'dotenv/config'
import express  from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Note } from './models/note.js';

const app = express();
const port = process.env.PORT

app.use(express.static('dist'));

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  },
   {
    id: "4",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]



app.use(cors());

app.use(express.json());

app.use(
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
});

app.get('/api/notes/:id', (req, res, next) => {
   Note.findById(req.params.id).then(note => {
    if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
  }) .catch(error => {
     next(error)
    })
});

app.post('/api/notes', (req, res, next) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    res.json(savedNote)
  }).catch(error => next(error))
});

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body

  Note.findById(req.params.id)
    .then(note => { 
      if (!note) {
        return res.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        res.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res) => {
 Note.findByIdAndDelete(req.params.id)

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (req, res) => {
 Note.findByIdAndDelete(req.params.id)
  .then(() => {
    res.status(204).end()
  }).catch(error => next(error))
});


const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }   else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running`);
});