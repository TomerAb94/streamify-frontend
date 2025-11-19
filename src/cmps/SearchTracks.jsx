import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import {
  setTracks,
  setCurrentTrack,
  setCurrentStationId,
  setIsPlaying,
} from '../store/actions/track.actions'

import { SvgIcon } from './SvgIcon'
import { updateStation } from '../store/actions/station.actions'
import { NavLink, useOutletContext } from 'react-router-dom'
import { Loader } from './Loader'

export function SearchTracks() {
  const { onOpenStationsContextMenu, onCloseStationsContextMenu } = useOutletContext()
  const params = useParams()
   const navigate = useNavigate()
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const stations = useSelector((storeState) => storeState.stationModule.stations)
  const [searchedTracks, setSearchedTracks] = useState([])
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)
  const [clickedTrackId, setClickedTrackId] = useState(null)

  useEffect(() => {
    if (params.searchStr) {
      loadSearchedTracks()
    }
  }, [params.searchStr])

  async function loadSearchedTracks() {
    try {
      const spotifyTracks = await spotifyService.getSpotifyItems('search', params.searchStr, 20)
      setSearchedTracks(spotifyTracks)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  function isTrackCurrentlyPlaying(track) {
    return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
  }

  async function onPlay(track) {
    try {
      // Clear current station ID since playing from search results
      setCurrentStationId(null)
      
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      // Get YouTube ID for the track
      const youtubeId = await getYoutubeId(track.name)
      console.log(youtubeId);
      
      const trackWithYoutube = {
        ...track,
        youtubeId,
      }

      // Set single track as playlist and play it
      await setTracks([trackWithYoutube])
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing track:', err)
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

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  function handleRowClick(track) {
    setClickedTrackId(track.spotifyId)
  }

  function isTrackInStation(track) {
    return stations.some(
      (s) => s.tracks && s.tracks.some((t) => t.spotifyId === track.spotifyId)
    )
  }

  function handleOpenStationsContextMenu(ev, track) {
    ev.stopPropagation()
    setClickedTrackId(track.spotifyId)
    onOpenStationsContextMenu(track, ev.clientX, ev.clientY)
  }

  function handleCloseStationsContextMenu(ev) {
    ev.stopPropagation()
    onCloseStationsContextMenu()
  }

  async function onAddToLikedSongs(track) {
    try {
      const likedSongs = stations.find((station) => station.title === 'Liked Songs')
      if (!likedSongs) return

      const isTrackInLikedSongs = likedSongs.tracks.some(
        (t) => t.spotifyId === track.spotifyId
      )
      if (isTrackInLikedSongs) {
        return
      }

      // Create clean track without player state properties
      const cleanTrack = { ...track }
      delete cleanTrack.isPlaying
      delete cleanTrack.youtubeId

      const updatedLikedSongs = {
        ...likedSongs,
        tracks: [...likedSongs.tracks, cleanTrack],
      }

      await updateStation(updatedLikedSongs)
    } catch (err) {
      console.error('Error adding track to Liked Songs:', err)
    }
  }

  function handleNavToAll() {
    navigate(`/search/${params.searchStr}`)
  }

  function handleNavToArtists() {
    navigate(`/search/artists/${params.searchStr}`)
  }


  if (!searchedTracks?.length) {
    return (
        <section className="search-tracks">
          <div className="loader-center">
            <Loader />
          </div>
        </section>
    )
  }

  return (
    <section className="search-tracks">
           <nav className="search-nav">
        <button className="nav-button" onClick={handleNavToAll}>
          All
        </button>
        <button className="nav-button active">
          Songs
        </button>
        <button className="nav-button" onClick={handleNavToArtists}>
          Artists
        </button>
      </nav>
      <section className="track-list">
        <div className="track-header">
          <div className="first-col-header">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="duration-header-icon">
            <SvgIcon iconName="duration" className="duration" />
          </div>
        </div>

        {searchedTracks.map((track, idx) => (
          <div
            className={`track-row ${
              clickedTrackId === track.spotifyId ? 'clicked' : ''
            }`}
            key={track.spotifyId ? `${track.spotifyId}-${idx}` : `track-${idx}`}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
            onClick={(ev) => {
              handleCloseStationsContextMenu(ev)
              handleRowClick(track)
              onPlay(track)
            }}
          >
            <div
              className={`track-num ${
                currentTrack && currentTrack.spotifyId === track.spotifyId
                  ? 'playing'
                  : ''
              }`}
            >
              {isTrackCurrentlyPlaying(track) ? (
                hoveredTrackIdx === idx ? (
                  <SvgIcon
                    iconName="pause"
                    className="pause"
                    onClick={() => onPause()}
                  />
                ) : (
                  <SvgIcon iconName="equalizer" className="equalizer" />
                )
              ) : hoveredTrackIdx === idx ? (
                <SvgIcon
                  iconName="play"
                  className="play"
                  onClick={() => onPlay(track)}
                />
              ) : (
                idx + 1
              )}
            </div>

            <div className="track-title">
              {track.album?.imgUrl && (
                <img
                  src={track.album.imgUrl}
                  alt={`${track.name} cover`}
                  className="track-img"
                />
              )}
              <div className="track-text">
                {/* <NavLink to={`/track/${track.spotifyId}`}> */}
                  <span
                    className={`track-name nav-link ${
                      currentTrack && currentTrack.spotifyId === track.spotifyId
                        ? 'playing'
                        : ''
                    }`}
                  >
                    {track.name}
                  </span>
                {/* </NavLink> */}
                <div className="track-artists">
                  <NavLink
                    key={track.artists[0].id[0]}
                    to={`/artist/${track.artists[0].id[0]}`}
                  >
                    <span className="nav-link">{track.artists[0].name}</span>
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="track-album">
              <NavLink
                to={`/album/${track.album?.spotifyId}`}
                className="album-name nav-link"
              >
                {track.album?.name}
              </NavLink>
              </div>
            <div className="track-duration-container">
              <SvgIcon
                iconName={
                  isTrackInStation(track) ? 'inStation' : 'addLikedSong'
                }
                className="add-to-playlist"
                title="Add to Playlist"
                onClick={
                  isTrackInStation(track)
                    ? (ev) => handleOpenStationsContextMenu(ev, track)
                    : () => onAddToLikedSongs(track)
                }
              />
              <span className="track-duration">{track.duration}</span>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}