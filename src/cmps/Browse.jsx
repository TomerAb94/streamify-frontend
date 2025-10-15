import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {genreColors} from '../assets/genreColors/genreColors'
export function Browse() {
  const [genres, setGenres] = useState([])

  const [selectedGenre, setSelectedGenre] = useState(null)

  useEffect(() => {
    loadGenres()
  }, [])

  async function loadGenres() {
    try {
      const genres = await spotifyService.getGenres()
    //   console.log('genres:', genres)
      setGenres(genres)
    } catch (error) {
      console.error('Failed loading genres:', error)
    }
  }


  async function onSelectGenre(genre) {
    const playlists = await spotifyService.getGenrePlaylists(genre)
    // console.log('playlists:', playlists)
    setSelectedGenre(genre)
   
  }

  if (!genres.length) return <div>Loading...</div>

  return (
    <div className="browse-container">
      <h1>Browse all</h1>
      <div className="genres-list">
        {genres.map((genre,idx) => (
           <NavLink to={`/browse/genre/${genre.name}`} key={genre.id}>
          <div className="genre-item" onClick={() => onSelectGenre(genre.name)} style={{ backgroundColor: genreColors[idx % genreColors.length] }}>
           
           
              {genre.icons?.[0]?.url && (
              <img src={genre.icons[0].url} alt={genre.name} />
              )}
              <h3 className='genre-title'>{genre.name}</h3>
           
         
          </div>
           </NavLink>
        ))}
      </div>
    </div>
  )
}

