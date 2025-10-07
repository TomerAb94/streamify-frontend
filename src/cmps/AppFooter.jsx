import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import { updateTrack } from '../store/actions/track.actions'

export function AppFooter() {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)

  function onPlayPause(track) {
    track.isPlaying = !track.isPlaying
    updateTrack(track)
  }

  function isPlaylistPlaying() {
    return playlist.some((track) => track.isPlaying)
  }

  return (
    <footer className="app-footer full">
      <div className="player-left">
        <div className="cover" aria-hidden="true">
          Cover
        </div>
        <div className="mini-track">
          <div className="title">Track title</div>
          <div className="artist">Artist name</div>
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
          <button aria-label="Previous">
            <SvgIcon iconName="previous" className="previous" />
          </button>
          <button onClick={() => onPlayPause(playlist[0])} aria-label="Play">
            {isPlaylistPlaying() ? (
              <SvgIcon iconName="pause" className="pause" />
            ) : (
              <SvgIcon iconName="play" className="play" />
            )}
          </button>
          <button aria-label="Next">
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
