import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'
import { NavLink, useNavigate, useOutletContext } from 'react-router-dom'
import { addStation, updateStation } from '../store/actions/station.actions'
import { updateUser } from '../store/actions/user.actions'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { stationService } from '../services/station/'

export function TrackList({ tracks, onPlay, onPause }) {
  const { onOpenStationsContextMenu, onCloseStationsContextMenu } =
    useOutletContext()
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const station = useSelector((storeState) => storeState.stationModule.station)
  const loggedInUser = useSelector((storeState) => storeState.userModule.user)

  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)
  const [clickedTrackId, setClickedTrackId] = useState(null)

  
    const useIsMobile = (breakpoint = 768) => {
      const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint)
  
      useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }, [breakpoint])
  
      return isMobile
    }
  
    const isMobile = useIsMobile()


  const navigate = useNavigate()

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  function handleRowClick(track) {
    setClickedTrackId(track.spotifyId)
  }

  function isTrackCurrentlyPlaying(track) {
    return (
      currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
    )
  }

  async function onAddToLikedSongs(track) {
    try {
      const likedSongs = stations.find(
        (station) => station.title === 'Liked Songs'
      )
      if (!likedSongs) return

      const isTrackInLikedSongs = likedSongs.tracks.some(
        (t) => t.spotifyId === track.spotifyId
      )
      if (isTrackInLikedSongs) {
        console.log('Track already in Liked Songs')
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

  async function onAddStation(ev) {
    ev.stopPropagation()
    ev.preventDefault()
    if (!loggedInUser) {
      showErrorMsg('You must be logged in to add a station')
      return
    }
    const playlistStations = stations.filter(
      (station) => station.stationType === 'playlist'
    )
    const count = playlistStations.length + 1
    const station = stationService.getEmptyStation()
    station.title += count
    try {
      const savedStation = await addStation(station)
      loggedInUser.ownedStationIds.push(savedStation._id)
      const savedUser = await updateUser(loggedInUser)

      showSuccessMsg(`Station added (id: ${savedStation._id})`)
      navigate(`/station/${savedStation._id}`)
    } catch (err) {
      showErrorMsg('Cannot add station')
    }
  }
  
  function formatDateAdded(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 7) {
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      if (diffWeeks === 1) return '1 week ago'
      return `${diffWeeks} weeks ago`
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  }
  return (
    <section className="track-list">
      <div className="track-header">
        <div className="first-col-header">#</div>
        <div>Title</div>
        <div>Album</div>
        <div>Date Added</div>
        <div className="duration-header-icon">
          <SvgIcon iconName="duration" className="duration" />
        </div>
      </div>

      {tracks.map((track, idx) => (
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

          <div
            className={`track-title ${
              currentTrack && currentTrack.spotifyId === track.spotifyId
                ? 'playing'
                : ''
            }`}
          >
            {track.album?.imgUrl && (
              <img
                src={track.album.imgUrl}
                alt={`${track.name} cover`}
                className="track-img"
              />
            )}

              {isMobile && isTrackCurrentlyPlaying(track) ? (
                 <div className="track-text">
        
                       <SvgIcon iconName="equalizer" className="equalizer" />
              <NavLink
                to={`/track/${track.spotifyId}`}
                className="track-name nav-link"
              >
                {track.name}
              </NavLink>
                 
                
              <div className="track-artists">
                {track.artists.map((artist, i) => (
                  <NavLink key={artist.id} to={`/artist/${artist.id?.[i]}`}>
                    <span className="nav-link artist-name">
                      {artist.name}
                      {i < track.artists.length - 1 ? ', ' : ''}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>


           ) : (

             <div className="track-text">
              <NavLink
                to={`/track/${track.spotifyId}`}
                className="track-name nav-link"
              >
                {track.name}
              </NavLink>
              <div className="track-artists">
                {track.artists.map((artist, i) => (
                  <NavLink key={artist.id} to={`/artist/${artist.id?.[i]}`}>
                    <span className="nav-link artist-name">
                      {artist.name}
                      {i < track.artists.length - 1 ? ', ' : ''}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>



            )}








          </div>

          <div className="track-album">
            <NavLink
              to={`/album/${track.album?.spotifyId}`}
              className="album-name nav-link"
            >
             {track.album?.name}
            </NavLink>
          </div>

          <div className="date-added">
            <span>{formatDateAdded(track.dateAdded)}</span>
          </div>

          <div className="track-duration-container">
            <SvgIcon
              iconName={isTrackInStation(track) ? 'inStation' : 'addLikedSong'}
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
  )
}

