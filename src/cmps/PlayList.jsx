import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'

export function PlayList( ) {
    const params = useParams()
    const [playlist, setPlaylist] = useState(null)

    useEffect(() => {
        loadPlaylist()
        console.log('playlist:', playlist)
    }, [params.playlistId])

    async function loadPlaylist() {
        try {
            const playlist = await spotifyService.getTracksPlaylist(params.playlistId)
            console.log('playlist:', playlist)
            setPlaylist(playlist)
        } catch (error) {
            console.error('Failed loading playlists:', error)
        }
    }
    return (
        <div>playlist {params.playlistId}</div>
    )
}

