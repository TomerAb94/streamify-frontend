import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'
import { NavLink, useNavigate } from 'react-router-dom'
import { addStation, updateStation } from '../store/actions/station.actions'
import { StationsContextMenu } from './StationsContextMenu'
import { updateUser } from '../store/actions/user.actions'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { stationService } from '../services/station/'

export function TrackList({ tracks, onPlay, onPause }) {
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
  const [contextMenuTrackId, setContextMenuTrackId] = useState(null)
  const [clickedTrackId, setClickedTrackId] = useState(null)

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

  function onOpenStationsContextMenu(ev, trackId) {
    ev.stopPropagation()
    setContextMenuTrackId(trackId)
    setClickedTrackId(trackId)
  }

  function onCloseStationsContextMenu(ev) {
    ev.stopPropagation()
    setContextMenuTrackId(null)
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

  async function onUpdateStations(stations) {
    const stationsToSave = stations.map((station) => ({ ...station }))
    try {
      for (const station of stationsToSave) {
        await updateStation(station)
      }
      showSuccessMsg(`Stations updated successfully`)
    } catch (err) {
      showErrorMsg('Cannot update station')
    }
  }

  return (
    <section className="track-list">
      <div className="track-header">
        <div className="first-col-header">#</div>
        <div>Title</div>
        <div>Album</div>
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
            onCloseStationsContextMenu(ev)
            handleRowClick(track)
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
                    <span className="nav-link">
                      {artist.name}
                      {i < track.artists.length - 1 ? ', ' : ''}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="track-album">{track.album?.name}</div>
          <div className="track-duration-container">
            <SvgIcon
              iconName={isTrackInStation(track) ? 'inStation' : 'addLikedSong'}
              className="add-to-playlist"
              title="Add to Playlist"
              onClick={
                isTrackInStation(track)
                  ? (ev) => onOpenStationsContextMenu(ev, track.spotifyId)
                  : () => onAddToLikedSongs(track)
              }
            />
            {contextMenuTrackId === track.spotifyId && (
              <StationsContextMenu
                stations={stations}
                track={track}
                onAddStation={onAddStation}
                onClose={onCloseStationsContextMenu}
                onUpdateStations={onUpdateStations}
              />
            )}
            <span className="track-duration">{track.duration}</span>
          </div>
        </div>
      ))}
    </section>
  )
}

// onRemoveFromLikedSongs(track)/
