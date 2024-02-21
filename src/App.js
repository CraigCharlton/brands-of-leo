import { useEffect, useState, useRef } from 'react'
import { Routes, Route, createSearchParams, useSearchParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'
import 'reactjs-popup/dist/index.css'
import { fetchMovies } from './data/moviesSlice'
import { ENDPOINT_SEARCH, ENDPOINT_DISCOVER, ENDPOINT, API_KEY } from './constants'
import Header from './components/Header'
import Movies from './components/Movies'
import Starred from './components/Starred'
import WatchLater from './components/WatchLater'
import YouTubePlayer from './components/YoutubePlayer'
import './app.scss'

const App = () => {

  const state = useSelector((state) => state)
  const { movies } = state
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const [videoKey, setVideoKey] = useState()
  const [isOpen, setOpen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const loadingRef = useRef(null);
  const navigate = useNavigate()

  const closeModal = () => setOpen(false)

  const closeCard = () => {

  }

  const getSearchResults = (query) => {
    if (query !== '') {
      dispatch(fetchMovies(`${ENDPOINT_SEARCH}&query=` + query + `&page=${pageNumber}`))
      setSearchParams(createSearchParams({ search: query }))
    } else {
      dispatch(fetchMovies(ENDPOINT_DISCOVER + `&page=${pageNumber}`))
      setSearchParams()
    }
  }

  const searchMovies = (query) => {
    navigate('/')
    getSearchResults(query)
  }

  const getMovies = () => {
    if (searchQuery) {
      dispatch(fetchMovies(`${ENDPOINT_SEARCH}&query=` + searchQuery + `&page=${pageNumber}`))
    } else {
      dispatch(fetchMovies(ENDPOINT_DISCOVER + `&page=${pageNumber}`))
    }
  }

  const viewTrailer = (movie) => {
    getMovie(movie.id)
    if (!videoKey) setOpen(true)
    setOpen(true)
  }

  const getMovie = async (id) => {
    const URL = `${ENDPOINT}/movie/${id}?api_key=${API_KEY}&append_to_response=videos`

    setVideoKey(null)
    const videoData = await fetch(URL)
      .then((response) => response.json())

    if (videoData.videos && videoData.videos.results.length) {
      const trailer = videoData.videos.results.find(vid => vid.type === 'Trailer')
      setVideoKey(trailer ? trailer.key : videoData.videos.results[0].key)
    }
  }

  useEffect(() => {
    getMovies(pageNumber)
  }, [pageNumber])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPageNumber((page) => page + 1);
        }
      },
      { threshold: 0.5 }
    );
    if (loadingRef.current) observer.observe(loadingRef.current);

    return () => {
      if (observer.current) {
        observer.unobserve(observer.current);
      }
    };
  }, [loadingRef]);

  return (
    <div className="App">
      <Header searchMovies={searchMovies} searchParams={searchParams} setSearchParams={setSearchParams} />

      <div className="container">
        {isOpen ? (
          <div className="modal-container">
            <div className='modal-player'>
              <span className='modal-close' onClick={() => closeModal()}>X</span>
              {videoKey ? (
                <YouTubePlayer
                  videoKey={videoKey}
                />
              ) : (
                <div style={{ padding: "30px" }}><h6>no trailer available. Try another movie</h6></div>
              )}
            </div>
          </div>
        ) : (<div></div>)}

        <Routes>
          <Route path="/" element={<Movies movies={movies} viewTrailer={viewTrailer} closeCard={closeCard} />} />
          <Route path="/starred" element={<Starred viewTrailer={viewTrailer} />} />
          <Route path="/watch-later" element={<WatchLater viewTrailer={viewTrailer} />} />
          <Route path="*" element={<h1 className="not-found">Page Not Found</h1>} />
        </Routes>
        <div className="loader" ref={loadingRef}>
          <h3>Loading....</h3>
        </div>
      </div>
    </div>
  )
}

export default App
