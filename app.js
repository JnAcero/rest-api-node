const express = require('express')
const movies = require('./movies.json')
const fs = require('node:fs')
const { Pager } = require('./Pager.js')
const { validateMovie, validatePartialMovie } = require('./Schemas/MovieSchema.js')

const app = express()
app.use(express.json())
app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
  'index.html',
  'http://localhost:1235'
]

app.get('/movies', (req, res) => {
  const { genre, page } = req.query
  const origin = req.header('origin')
  console.log(origin)
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Origin', '*')
  if (genre) {
    const filteredMovies = movies.filter(m => m.generos.some(g => g.toLowerCase() === genre.toLocaleLowerCase()))
    if (filteredMovies.length < 1) {
      return res.json({ mensaje: `No existen peliculas del genero: ${genre}` })
    }
    return res.json(filteredMovies)
  } else if (page) {
    const pager = new Pager(movies, parseInt(page), 2)
    return res.json(pager.pageRecords())
  }

  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(m => m.id === parseInt(id))
  if (movie) return res.json(movie)

  res.status(404).json({ messaje: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ message: JSON.parse(result.error.message) })
  }

  movies.push(result.data) // Datos validados

  fs.writeFile('./movies.json', JSON.stringify(movies), 'utf-8', (err) => {
    if (err) {
      console.log(err)
      return res.status(500).send('Error writing file')
    }

    res.status(201).json(result.data)
  })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ message: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === parseInt(id))

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const movie = movies[movieIndex]
  //  cualquier propiedad que tenga el mismo nombre en ambos objetos (movie y result.data) tomará el valor de result.data. Esto sucede porque la propagación de result.data ocurre después de la propagación de movie, y los valores de result.data sobrescriben los valores correspondientes en movie.
  const updatedMovie = {
    ...movie,
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === parseInt(id))

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.options('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE') // Métodos como una cadena

  res.sendStatus(200)
})

const PORT = process.env.PORT ?? 1235

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})
