import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'
import { FastAverageColor } from 'fast-average-color'
import { NavLink } from 'react-router-dom'

import { setIsPlaying } from '../store/actions/track.actions'

export function AppFooterMobile() {
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)

  const [isTimelineHover, setIsTimelineHover] = useState(false)
  const [seeking, setSeeking] = useState(false)

  const handleMouseEnterTimeline = () => setIsTimelineHover(true)
  const handleMouseLeaveTimeline = () => setIsTimelineHover(false)

  const progressSec = useSelector((storeState) => storeState.trackModule.progressSec)

  useEffect(() => {
    const fac = new FastAverageColor()
    const imgElement = document.querySelector(`.now-playing-mobile-img`)
    const background = document.querySelector('.now-playing-mobile')
    if (imgElement && background) {
      imgElement.crossOrigin = 'Anonymous'
      fac
        .getColorAsync(imgElement, { algorithm: 'dominant' })
        .then((color) => {
          const [r, g, b] = color.value
          const darkerColor = `rgba(${r * 0.4}, ${g * 0.4}, ${b * 0.4}, 1)`
          background.style.backgroundColor = darkerColor
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }, [currentTrack?.spotifyId])

  function onPlay(event) {
    event.stopPropagation()
    setIsPlaying(true)
  }

  function onPause(event) {
    event.stopPropagation()
    setIsPlaying(false)
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

  const baseProgress = Math.min(durationSecNumeric, seeking ? draftSec : progressSec)

  // Formatter for the left timestamp - current time of track (or seek time)
  const currentTrackTime = (() => {
    const timeInSec = Math.max(0, Math.floor(baseProgress))
    const mm = Math.floor(timeInSec / 60)
    const ss = String(timeInSec % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })()

  const progressPct = durationSecNumeric > 0 ? Math.min(100, Math.max(0, (baseProgress / durationSecNumeric) * 100)) : 0

  return (
    <div className="app-footer-mobile">
      {currentTrack && (
        <div className="now-playing-mobile">
          <img
            className="now-playing-mobile-img"
            src={`${currentTrack?.album.imgUrl || currentTrack?.album.imgUrls[0]}`}
            alt=""
          />
          <div className="now-playing-mobile-info">
            <div className="now-playing-mobile-title">{currentTrack?.name}</div>
            <div className="now-playing-mobile-artist">{currentTrack?.artists[0].name}</div>
          
          </div>
          {!isPlaying ? (
            <SvgIcon iconName="play" className="play-container" onClick={(event) => onPlay(event)} />
          ) : (
            <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
          )}
            <div className="track-timeline">
              {/* <span className="time right">{currentTrackTime}</span> */}
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
                  background:`linear-gradient(to right,
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
              {/* <span className="time left">{currentTrack?.duration}</span> */}
            </div>
        </div>
      )}

      <NavLink to="/" className="mobile-nav-item">
        <SvgIcon iconName="home" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className="mobile-nav-item">
        <SvgIcon iconName="search" />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className="mobile-nav-item">
        <SvgIcon iconName="defaultList" />
        <span>Your Library</span>
      </NavLink>
    </div>
  )
}
