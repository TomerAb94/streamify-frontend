import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import {
  setIsPlaying,
  setCurrentTrack,
  setVolume,
  setSeekToSec,
} from '../store/actions/track.actions'

export function AppFooter({ onToggleQueue, isQueueOpen }) {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const volume = useSelector((storeState) => storeState.trackModule.volume)

  const progressSec = useSelector((storeState) => storeState.trackModule.progressSec)
  
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
    return (Number(m) * 60 + Number(s))
  })()

  const baseProgress = Math.min(durationSecNumeric, seeking ? draftSec : progressSec)

  // Formatter for the left timestamp - current time of track (or seek time)
  const currentTrackTime = (() => {
    const timeInSec = Math.max(0, Math.floor(baseProgress))
    const mm = Math.floor(timeInSec / 60)
    const ss = String (timeInSec % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })()

  const progressPct = durationSecNumeric > 0
    ? Math.min(100, Math.max(0, (baseProgress / durationSecNumeric) * 100))
    : 0

  return (
    <footer className="app-footer">
      <div className="track-info">
        <div className="track-cover">
          {currentTrack?.album?.imgUrl ? (
            <img
              src={currentTrack.album.imgUrl}
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
            <SvgIcon iconName="addLikedSong" className="liked-icon" />
            {/* <SvgIcon iconName="doneLikedSong" className="liked-icon is-on" /> */}
          </button>
        </div>
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
                ${isTimelineHover ? 'var(--green-clicked)' : 'var(--color-white-fff)'} 0%,
                ${isTimelineHover ? 'var(--green-clicked)' : 'var(--color-white-fff)'} ${progressPct}%,
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
