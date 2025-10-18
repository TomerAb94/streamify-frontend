import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import {
  setIsPlaying,
  setCurrentTrack,
  setVolume,
  setSeekToSec,
  setIsShuffle,
  setIsRepeat,
  setTracks,
} from '../store/actions/track.actions'
import { addStation, updateStation } from '../store/actions/station.actions'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { updateUser } from '../store/actions/user.actions'
import { stationService } from '../services/station'
import { StationsContextMenu } from './StationsContextMenu'
import { youtubeService } from '../services/youtube.service'

export function AppFooter({ onToggleQueue, isQueueOpen, onToggleNowPlaying, isNowOpen, onAddStation }) {
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
  const isShuffle = useSelector(
    (storeState) => storeState.trackModule.isShuffle
  )
  const isRepeat = useSelector(
    (storeState) => storeState.trackModule.isRepeat
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

  function handleToggleNowPlaying() {
    onToggleNowPlaying()
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
      if (nextTrack && nextTrack.youtubeId !== null) {
        await setCurrentTrack(nextTrack)
        await setIsPlaying(true)
      }

        if (nextTrack && nextTrack.youtubeId === null) {
        // If youtubeId is null, fetch it
        const youtubeId = await getYoutubeId(nextTrack.name)
        const updatedNextTrack = { ...nextTrack, youtubeId }
        await setCurrentTrack(updatedNextTrack)
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
      if (prevTrack && prevTrack.youtubeId !== null) {
        await setCurrentTrack(prevTrack)
        await setIsPlaying(true)
      }
       if (prevTrack && prevTrack.youtubeId === null) {
        // If youtubeId is null, fetch it
        const youtubeId = await getYoutubeId(prevTrack.name)
        const updatedPrevTrack = { ...prevTrack, youtubeId }
        await setCurrentTrack(updatedPrevTrack)
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

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getVideos(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  async function onShuffle() {
    // Toggle shuffle state
    const newShuffleState = !isShuffle
    setIsShuffle(newShuffleState)

    // Need playlist tracks to shuffle
    if (!playlist || playlist.length === 0) return

    // Clear existing playlist
    await setTracks([])

    let tracksToPlay = []

    if (newShuffleState) {
      // If turning shuffle ON, create shuffled playlist
      tracksToPlay = [...playlist].sort(() => Math.random() - 0.5)
    } else {
      // If turning shuffle OFF, restore original playlist order
      tracksToPlay = [...playlist].sort((a, b) => {
        return a.index - b.index
      })
    }

    // Create playlist with proper nextId and prevId based on current order
    // Don't fetch YouTube IDs here - only fetch when track is actually played
    const playlistQueue = tracksToPlay.map((track, index) => {
      return {
        ...track,
        nextId:
          index < tracksToPlay.length - 1
            ? tracksToPlay[index + 1].spotifyId
            : tracksToPlay[0].spotifyId,
        prevId:
          index > 0
            ? tracksToPlay[index - 1].spotifyId
            : tracksToPlay[tracksToPlay.length - 1].spotifyId,
        // Keep existing youtubeId if it exists, don't fetch new ones
        youtubeId: track.youtubeId || null,
      }
    })

    // Set the new playlist (shuffled or chronological)
    await setTracks(playlistQueue)

    // If turning shuffle ON, start playing the first track
    // If turning shuffle OFF, keep current track but update its connections
    if (newShuffleState) {
      const firstTrack = playlistQueue[0]
      if (firstTrack) {
        // Only fetch YouTube ID for the track that will actually be played
        if (!firstTrack.youtubeId) {
          const youtubeId = await getYoutubeId(firstTrack.name)
          const trackWithYoutube = {
            ...firstTrack,
            youtubeId,
          }
          await setCurrentTrack(trackWithYoutube)
        } else {
          await setCurrentTrack(firstTrack)
        }
        await setIsPlaying(true)
      }
    } else {
      // When turning shuffle OFF, update current track with new next/prev connections
      if (currentTrack) {
        const updatedCurrentTrack = playlistQueue.find(
          (track) => track.spotifyId === currentTrack.spotifyId
        )
        if (updatedCurrentTrack) {
          // Keep existing YouTube ID
          const trackWithYoutube = {
            ...updatedCurrentTrack,
            youtubeId: currentTrack.youtubeId || null,
          }
          await setCurrentTrack(trackWithYoutube)
        }
      }
    }
  }

  async function onRepeat() {
    const newRepeatState = !isRepeat
    await setIsRepeat(newRepeatState)
  }


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
            <button 
              onClick={onShuffle}
              className={`shuffle-btn ${isShuffle ? 'active' : ''}`}
              aria-label="Shuffle"
            >
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
            <button onClick={onRepeat} className={`repeat-btn ${isRepeat ? 'active' : ''}`}>
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
          onClick={handleToggleNowPlaying}
          className={`now-btn ${isNowOpen ? 'active' : ''}`}
          title="Now Playing"
        >
          <SvgIcon iconName="nowPlaying" />
        </button>
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
