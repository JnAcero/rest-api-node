const zod = require('zod')

const MovieSchema = zod.object({
  nombre: zod.string({
    required_error: 'The name of the movie is required'
  }),
  director: zod.string({
    required_error: 'The director´s name is required'
  }),
  personajes: zod.array(zod.string()),
  generos: zod.array(
    zod.enum(['Musical', 'Romance', 'Drama', 'Fanatsia', 'Accion', 'Aventura']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'The genre of the movie must be a enum of genre'
    }
  ),
  duracion: zod.number(
    {
      required_error: 'The duration of the movie is required',
      invalid_type_error: 'The duration must be a number'
    }).int().positive(),
  anio_publicacion: zod.number({ required_error: 'The year of publication s required' }).int().min(1899).max(2024)
})

function validateMovie (object) {
  return MovieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  return MovieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
