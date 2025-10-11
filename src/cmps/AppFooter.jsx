import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import {
  setIsPlaying,
  setCurrentTrack,
  setVolume,
} from '../store/actions/track.actions'

export function AppFooter({ onToggleQueue }) {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const volume = useSelector((storeState) => storeState.trackModule.volume)

  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

  function handleToggleQueue() {
    setIsQueueOpen(!isQueueOpen)
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
          <span className="time">0:00</span>
          <input
            className="time-range"
            type="range"
            min="0"
            max={currentTrack?.duration}
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
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  )
}
