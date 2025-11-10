import { useEffect, useRef, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { setTracks, setCurrentTrack, setIsPlaying } from '../store/actions/track.actions'
import { useSelector } from 'react-redux'
import { youtubeService } from '../services/youtube.service'
import { CompareSharp } from '@mui/icons-material'
import { Loader } from './Loader'

export function GenreList() {
  const location = useLocation()
  const color = location.state?.backgroundColor || '#222'
  const genreName = location.state?.name || 'Unknown Genre'
  const params = useParams()
  const [playlists, setPlaylists] = useState([])

  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)


  const [isHeaderVisible, setIsHeaderVisible] = useState()
  const myRef = useRef()

  useEffect(() => {
    loadPlaylists()
  }, [params.genreId])


  useEffect(() => {
    if (!myRef.current) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting & (entry.isIntersecting !== isHeaderVisible)) {
          // console.log('הכותרת יצאה מהמסך!', myRef.current)
          setIsHeaderVisible(false)
        } else {
          // console.log('הכותרת נראית במסך!', myRef.current)
          setIsHeaderVisible(true)
        }
      })
    })

    observer.observe(myRef.current)

    // cleanup function
    return () => {
      observer.disconnect()
    }
  }, [playlists])

  async function loadPlaylists() {
    try {
      const playlists = await spotifyService.getSpotifyItems('getGenrePlaylists', params.genreName)
      // console.log('playlists:', playlists)
      setPlaylists(playlists)
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

  async function loadPlaylist(stationId) {
    try {
      const playlist = await spotifyService.getSpotifyItems('getTracksPlaylist',stationId)
      // console.log('playlist:', playlist)
      return playlist
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

  async function onPlayFromOutside(event, stationId) {
    event.preventDefault()
    try {
      const playlistSpotifyDetails = await loadPlaylist(stationId)
      const { tracks, playlist } = playlistSpotifyDetails

     

      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }
      const youtubeId = await getYoutubeId(tracks[0].name + ' ' + tracks[0].artists[0]?.name)
      const trackWithYoutube = {
        ...tracks[0],
        youtubeId,
      }

      // Implement play logic here
      await setTracks(tracks)
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing :', err)
    }
  }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getYoutubeItems((str))
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  async function onPause(event) {
    event.preventDefault()
    await setIsPlaying(false)
  }

  function isPlaylistPlaying(playlistId) {
    if (!currentTrack || !isPlaying) return false
    return currentTrack?.spotifyPlaylistId === playlistId
  }

  if (!playlists.length) return (
    <div className="browse-container">
      <div className="loader-center">
        <Loader />
      </div>
    </div>
  )

  return (
    <>
      <div className="browse-container">
          <span className='transparent-div' ref={myRef}></span>
        <div
          className={`genre-header ${isHeaderVisible ? '' : 'not-visible'}`}
          style={{ background: `linear-gradient(to bottom,${color}, rgba(0, 0, 0, 0.01) 100%)` }}
        >
         
          <h1 className={`header `}>{genreName}</h1>
         
        </div>


        <div className="playlists-container">
          {playlists.map((station) => {
            const isStationPlaying = isPlaylistPlaying(station.id)
            return (
              <NavLink
                className={`playlist-item ${isStationPlaying ? 'playing' : ''}`}
                to={`/browse/genre/${params.genreName}/${station.id}`}
                key={station.id}
              >
                <div className="playlist-img-container">
                  {station.images?.[0]?.url && <img src={station.images[0].url} alt={station.name} />}

                  {isStationPlaying ? (
                    <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
                  ) : (
                    <SvgIcon
                      iconName="play"
                      className="play-container"
                      onClick={(event) => onPlayFromOutside(event, station.id)}
                    />
                  )}
                </div>

                <h3 className="playlist-name">{station.name}</h3>

                <h3 className="playlist-description">{station.description ? station.description : ''}</h3>
              </NavLink>
            )
          })}
        </div>
      </div>
    </>
  )
}
