import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import {
  setIsPlaying,
  setCurrentTrack,
  setVolume,
  setSeekToSec,
} from '../store/actions/track.actions'
import { addStation, updateStation } from '../store/actions/station.actions'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { updateUser } from '../store/actions/user.actions'
import { stationService } from '../services/station'
import { StationsContextMenu } from './StationsContextMenu'

export function AppFooter({ onToggleQueue, isQueueOpen }) {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const volume = useSelector((storeState) => storeState.trackModule.volume)

  const progressSec = useSelector(
    (storeState) => storeState.trackModule.progressSec
  )

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)

  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)
  const [isVolumeHover, setIsVolumeHover] = useState(false)
  const [isTimelineHover, setIsTimelineHover] = useState(false)
  const [seeking, setSeeking] = useState(false)
  const [draftSec, setDraftSec] = useState(0)

  const handleMouseEnterVolume = () => setIsVolumeHover(true)
  const handleMouseLeaveVolume = () => setIsVolumeHover(false)

  const handleMouseEnterTimeline = () => setIsTimelineHover(true)
  const handleMouseLeaveTimeline = () => setIsTimelineHover(false)

  function handleToggleQueue() {
    onToggleQueue()
  }

  async function onPlayPause() {
    try {
      await setIsPlaying(!isPlaying)
    } catch (err) {
      console.error('Error toggling play/pause:', err)
    }
  }

  function isTrackInStation(track) {
    if (!track) return false
    // check if track is in 'Liked Songs'
    const likedSongs = stations.find((s) => s.title === 'Liked Songs')
    const isInLikedSongs =
      likedSongs?.tracks.some((t) => t.spotifyId === track.spotifyId) || false

    return isInLikedSongs
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
      showSuccessMsg(
        `Stations updated, new pin: ${stationsToSave.map((s) => s.isPinned)}`
      )
    } catch (err) {
      showErrorMsg('Cannot update station')
    }
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

  function onOpenStationsContextMenu(ev) {
    ev.stopPropagation()
    setIsContextMenuOpen(true)
  }

  function onCloseStationsContextMenu(ev) {
    ev.stopPropagation()
    setIsContextMenuOpen(false)
  }

  async function onNext() {
    if (!currentTrack || !currentTrack.nextId) return

    try {
      // Find the next track in the playlist using nextId
      const nextTrack = playlist.find(
        (track) => track.spotifyId === currentTrack.nextId
      )
      if (nextTrack) {
        await setCurrentTrack(nextTrack)
        await setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing next track:', err)
    }
  }

  async function onPrevious() {
    if (!currentTrack || !currentTrack.prevId) return

    try {
      // Find the previous track in the playlist using prevId
      const prevTrack = playlist.find(
        (track) => track.spotifyId === currentTrack.prevId
      )
      if (prevTrack) {
        await setCurrentTrack(prevTrack)
        await setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing previous track:', err)
    }
  }

  function handleChangeVolume(event) {
    const newVolume = event.target.value / 100 // Convert to 0-1 range
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  function handleToggleMute() {
    if (volume > 0) {
      setPreviousVolume(volume) // Store current volume before muting
      setVolume(0)
      setIsMuted(true)
    } else {
      setVolume(previousVolume) // Restore previous volume
      setIsMuted(false)
    }
  }

  function onSeekStart() {
    setSeeking(true)
    setDraftSec(progressSec)
  }

  function onSeekChange(ev) {
    setDraftSec(Number(ev.target.value))
  }

  function onSeekCommit(ev) {
    setSeekToSec(Number(ev.target.value))
    setSeeking(false)
  }

  // One-time inline function for parse duration from "m:ss" label to numeric duration, it helps the track-player seek correctly
  const durationSecNumeric = (() => {
    const dur = currentTrack?.duration
    if (!dur) return 0
    const [m, s] = String(dur).split(':')
    return Number(m) * 60 + Number(s)
  })()

  const baseProgress = Math.min(
    durationSecNumeric,
    seeking ? draftSec : progressSec
  )

  // Formatter for the left timestamp - current time of track (or seek time)
  const currentTrackTime = (() => {
    const timeInSec = Math.max(0, Math.floor(baseProgress))
    const mm = Math.floor(timeInSec / 60)
    const ss = String(timeInSec % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })()

  const progressPct =
    durationSecNumeric > 0
      ? Math.min(100, Math.max(0, (baseProgress / durationSecNumeric) * 100))
      : 0

  return (
    <footer
      className="app-footer"
      onClick={(ev) => onCloseStationsContextMenu(ev)}
    >
      <div className="track-info">
        <div className="track-cover">
          {currentTrack?.album?.imgUrl || currentTrack?.album?.imgUrls?.[0] ? (
            <img
              src={
                currentTrack?.album?.imgUrl || currentTrack?.album?.imgUrls?.[0]
              }
              alt={`${currentTrack.name} cover`}
              className="cover-img"
            />
          ) : (
            <div className="cover-placeholder"></div>
          )}
        </div>
        <div className="mini-track">
          <div className="title">{currentTrack?.name || ''}</div>
          <div className="artist">
            {currentTrack?.artists?.map((artist) => artist.name).join(', ') ||
              ''}
          </div>
        </div>
        <div className="btn-like">
          <button className="btn-mini-liked">
            <SvgIcon
              iconName={
                isTrackInStation(currentTrack) ? 'inStation' : 'addLikedSong'
              }
              className="add-to-playlist"
              title="Add to Playlist"
              onClick={
                isTrackInStation(currentTrack)
                  ? (ev) => onOpenStationsContextMenu(ev)
                  : () => onAddToLikedSongs(currentTrack)
              }
            />
            {/* <SvgIcon iconName="doneLikedSong" className="liked-icon is-on" /> */}
          </button>
        </div>
        {isContextMenuOpen && (
          <StationsContextMenu
            stations={stations}
            track={currentTrack}
            onAddStation={onAddStation}
            onClose={onCloseStationsContextMenu}
            onUpdateStations={onUpdateStations}
          />
        )}
      </div>

      <div className="player-container">
        <div className="player-btns">
          <div className="left-btns">
            <button aria-label="Shuffle">
              <SvgIcon iconName="shuffle" className="shuffle" />
            </button>
            <button
              onClick={onPrevious}
              disabled={!currentTrack || !currentTrack.prevId}
              aria-label="Previous"
            >
              <SvgIcon iconName="previous" className="previous" />
            </button>
          </div>
          <div className="play-btn">
            <button onClick={onPlayPause} aria-label="Play">
              {isPlaying ? (
                <SvgIcon iconName="pause" className="pause" />
              ) : (
                <SvgIcon iconName="play" className="play" />
              )}
            </button>
          </div>
          <div className="right-btns">
            <button
              onClick={onNext}
              disabled={!currentTrack || !currentTrack.nextId}
              aria-label="Next"
            >
              <SvgIcon iconName="next" className="next" />
            </button>
            <button aria-label="Repeat">
              <SvgIcon iconName="repeat" className="repeat" />
            </button>
          </div>
        </div>
        <div className="track-timeline">
          <span className="time">{currentTrackTime}</span>
          <input
            className="time-range"
            type="range"
            min="0"
            max={durationSecNumeric}
            step="0.1"
            value={baseProgress}
            onMouseDown={onSeekStart}
            onChange={onSeekChange}
            onMouseUp={onSeekCommit}
            onMouseEnter={handleMouseEnterTimeline}
            onMouseLeave={handleMouseLeaveTimeline}
            style={{
              background: `linear-gradient(to right,
                ${
                  isTimelineHover
                    ? 'var(--green-clicked)'
                    : 'var(--color-white-fff)'
                } 0%,
                ${
                  isTimelineHover
                    ? 'var(--green-clicked)'
                    : 'var(--color-white-fff)'
                } ${progressPct}%,
                var(--color-secondary-3) ${progressPct}%,
                var(--color-secondary-3) 100%)`,
            }}
          />
          <span className="time">{currentTrack?.duration}</span>
        </div>
      </div>

      <div className="extra-btns">
        <button
          onClick={handleToggleQueue}
          className={`queue-btn ${isQueueOpen ? 'active' : ''}`}
          title="Queue"
        >
          <SvgIcon iconName="queue" />
        </button>

        <div className="volume-container">
          <button onClick={handleToggleMute}>
            <SvgIcon iconName={isMuted || volume === 0 ? 'mute' : 'volume'} />
          </button>
          <input
            className="volume-input"
            onInput={handleChangeVolume}
            onMouseEnter={handleMouseEnterVolume}
            onMouseLeave={handleMouseLeaveVolume}
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            style={{
              background: `linear-gradient(to right, ${
                isVolumeHover
                  ? 'var(--green-clicked)'
                  : 'var(--color-white-fff)'
              } 0%, ${
                isVolumeHover
                  ? 'var(--green-clicked)'
                  : 'var(--color-white-fff)'
              } ${volume * 100}%, var(--color-secondary-3) ${
                volume * 100
              }%, var(--color-secondary-3) 100%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  )
}
