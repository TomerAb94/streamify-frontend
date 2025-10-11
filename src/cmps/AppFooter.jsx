import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import { setIsPlaying, setCurrentTrack } from '../store/actions/track.actions'

export function AppFooter({ onToggleQueue }) {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)

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
      const nextTrack = playlist.find(track => track.spotifyId === currentTrack.nextId)
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
      const prevTrack = playlist.find(track => track.spotifyId === currentTrack.prevId)
      if (prevTrack) {
        await setCurrentTrack(prevTrack)
        await setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing previous track:', err)
    }
  }

  return (
    <footer className="app-footer full">
      <div className="player-left">
        <div className="cover" aria-hidden="true">
          {currentTrack?.album?.imgUrl ? (
            <img 
              src={currentTrack.album.imgUrl} 
              alt={`${currentTrack.name} cover`}
              className="cover-img"
            />
          ) : (
            <div className="cover-placeholder">♪</div>
          )}
        </div>
        <div className="mini-track">
          <div className="title">
            {currentTrack?.name || 'No track selected'}
          </div>
          <div className="artist">
            {currentTrack?.artists?.map(artist => artist.name).join(', ') || 'Unknown artist'}
          </div>
        </div>
        <div className="btn-like">
          <button
            className="btn-mini-liked"
            aria-checked="false"
            aria-label="Add to Liked Songs"
          >
            <SvgIcon iconName="addLikedSong" className="liked-icon" />
            <SvgIcon iconName="doneLikedSong" className="liked-icon is-on" />
          </button>
        </div>
      </div>

      <div className="player-center">
        <div className="transport">
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
          <button onClick={onPlayPause} aria-label="Play">
            {isPlaying ? (
              <SvgIcon iconName="pause" className="pause" />
            ) : (
              <SvgIcon iconName="play" className="play" />
            )}
          </button>
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
        <div className="track-timeline">
          <span className="time-zero">0:00</span>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            aria-label="Seek"
          />
          <span className="time-end">3:45</span>
        </div>
      </div>

        <button 
          onClick={onToggleQueue}
          className="queue-btn"
          aria-label="Toggle queue"
          title="Show queue"
        >
          click
          {/* <SvgIcon iconName="queue" /> */}
        </button>

      <div className="player-right">
        <div className="volume">
          <SvgIcon iconName="volume" className="volume" />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="80"
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  )
}