import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import {
  setTracks,
  setCurrentTrack,
  setIsPlaying,
} from '../store/actions/track.actions'
import { SvgIcon } from './SvgIcon'
import { Loader } from './Loader'

export function SearchArtists() {
  const params = useParams()
  const navigate = useNavigate()
  
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  
  const [searchedArtists, setSearchedArtists] = useState([])
  const [currentlyPlayingArtist, setCurrentlyPlayingArtist] = useState(null)

  useEffect(() => {
    if (params.searchStr) {
      loadSearchedArtists()
    }
  }, [params.searchStr])

  async function loadSearchedArtists() {
    try {
      const spotifyArtists = await spotifyService.getSearchArtists(params.searchStr, 20)
      setSearchedArtists(spotifyArtists)
    } catch (err) {
      console.error('Error loading artists:', err)
    }
  }

  function isArtistCurrentlyPlaying(artist) {
    if (!currentTrack || !artist) return false
    
    // Check if this specific artist is the one we set as currently playing
    return currentlyPlayingArtist?.spotifyId === artist.spotifyId && isPlaying
  }

  async function onPlayArtist(artist) {
    try {
      // Set this artist as currently playing
      setCurrentlyPlayingArtist(artist)
      
      // Get full artist data including top tracks
      const fullArtistData = await spotifyService.getSpotifyItems('artistData', artist.spotifyId)
      
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      const playlistQueue = await Promise.all(
        fullArtistData.topTracks.map(async (track, index) => {
          return {
            ...track,
            nextId:
              index < fullArtistData.topTracks.length - 1
                ? fullArtistData.topTracks[index + 1].spotifyId
                : fullArtistData.topTracks[0].spotifyId,
            prevId:
              index > 0
                ? fullArtistData.topTracks[index - 1].spotifyId
                : fullArtistData.topTracks[fullArtistData.topTracks.length - 1].spotifyId,
            youtubeId: await getYoutubeId(track.name),
          }
        })
      )

      // Set the entire playlist at once
      await setTracks(playlistQueue)

      // Set the first track and start playing
      const firstTrack = playlistQueue[0]
      if (firstTrack) {
        await setCurrentTrack(firstTrack)
        await setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing artist tracks:', err)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getYoutubeItems(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  function handleNavToAll() {
    navigate(`/search/${params.searchStr}`)
  }

  function handleNavToSongs() {
    navigate(`/search/tracks/${params.searchStr}`)
  }

  if (!searchedArtists?.length) {
    return (
      <div className="browse-container">
        <div className="loader-center">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <section className="search-artists">
      <nav className="search-nav">
        <button className="nav-button" onClick={handleNavToAll}>
          All
        </button>
        <button className="nav-button" onClick={handleNavToSongs}>
          Songs
        </button>
        <button className="nav-button active">
          Artists
        </button>
      </nav>

      <section className="search-results">
        <div className="results-container">
          <div className="artist-result">
            <h2>Artists</h2>

            <div className="artists-container">
              {searchedArtists.map((artist) => (
                <NavLink
                  key={artist.id}
                  to={`/artist/${artist.spotifyId}`}
                  className="artist-item"
                >
                  <img src={artist.imgUrl} alt={artist.name} />
                  <div className="mini-info">
                    <h3>{artist.name}</h3>
                    <span>Artist</span>
                  </div>
                  <span className="btn-container">
                    {isArtistCurrentlyPlaying(artist) && isPlaying ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPause()
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="pause" className="pause" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPlayArtist(artist)
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="play" className="play" />
                      </button>
                    )}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}