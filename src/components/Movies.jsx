import Movie from './Movie'
import '../styles/movies.scss'

const Movies = ({ movies, viewTrailer, closeCard }) => {

  return (
    <div data-testid="movies" className='movies'>
      {movies.movies?.map((movie) => {
        return (
          <Movie
            movie={movie}
            key={movie.id}
            viewTrailer={viewTrailer}
            closeCard={closeCard}
          />
        )
      })}
    </div>
  )
}

export default Movies
