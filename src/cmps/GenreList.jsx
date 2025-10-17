import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'


export function GenreList( ) {
  const location = useLocation();
    const color = location.state?.backgroundColor || '#222';
    const genreName = location.state?.name || 'Unknown Genre';
    const params = useParams()
    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        loadPlaylists()
        console.log('location.state?.color:', location.state?.color)    
    }, [params.genreId])

    async function loadPlaylists() {
        try {
            const playlists = await spotifyService.getGenrePlaylists(params.genreName)
            // console.log('playlists:', playlists)
            setPlaylists(playlists)
        } catch (error) {
            console.error('Failed loading playlists:', error)
        }
    }
        if (!playlists.length) return <div>Loading...</div>
    return (
        <>
        <div className='browse-container'>
         
            <div className="genre-header" style={{ background: `linear-gradient(to bottom,${color}, rgba(0, 0, 0, 0.01) 100%)` }}>
             <h1 className='header'>{genreName}</h1>
                 
      </div>
            <div className="playlists-container">
            {playlists.map((station) => (
                
                <NavLink className="playlist-item" to={`/browse/genre/${params.genreName}/${station.id}`} key={station.id}>

                       <div className='playlist-img-container'>
                           {station.images?.[0]?.url && (
                               <img src={station.images[0].url} alt={station.name} />
                           )}
                               <SvgIcon iconName="play" className="play-container"  />
                       </div>

                       
                       
                        <h3 className='playlist-name'>{station.name}</h3>
                        
                         <h3 className='playlist-description'>{station.description?station.description:''}</h3>
                
                </NavLink>
            ))}
        </div></div>
         
        </>
    
    )
}

