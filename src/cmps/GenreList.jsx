import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'

export function GenreList( ) {

    const params = useParams()
    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        loadPlaylists()
        
    }, [params.genreId])

    async function loadPlaylists() {
        try {
            const playlists = await spotifyService.getGenrePlaylists(params.genreName)
            console.log('playlists:', playlists)
            setPlaylists(playlists)
        } catch (error) {
            console.error('Failed loading playlists:', error)
        }
    }
        if (!playlists.length) return <div>Loading...</div>
    return (
        <div className="genres-list">
            {playlists.map((station) => (
                <NavLink to={`/browse/genre/${params.genreName}/${station.id}`} key={station.id}>
                    <div className="playlist-item">
                        {station.images?.[0]?.url && (
                            <img src={station.images[0].url} alt={station.name} />
                        )}
                        <h3>{station.name}</h3>
                    </div>
                </NavLink>
            ))}
        </div>
    )
}

