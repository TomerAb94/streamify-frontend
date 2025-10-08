import { useDispatch, useSelector } from 'react-redux'

import { SvgIcon } from './SvgIcon'
import { setIsPlaying, setProgressPct, setSeekToSec, setVolume } from '../store/actions/track.actions'

// import { updateTrack } from '../store/actions/track.actions'

export function AppFooter() {
    const dispatch = useDispatch()

    const { currentTrack, isPlaying, volume, progressPct, durationSec } = useSelector((state) => state.trackModule)

    function onPlayClick() {
      if (!currentTrack?.youtubeId) return
      dispatch(setIsPlaying(!isPlaying))
      console.log('current track', currentTrack);
      
    }

    // function onPlayPause(track) {
    //     track.isPlaying = !track.isPlaying
    //     updateTrack(track)
    // }

    // function isPlaylistPlaying() {
    //     return playlist.some((track) => track.isPlaying)
    // }

    function onSeekChange(ev) {
      const pct = Number(ev.target.value)
      const targetSec = (pct / 100) * (durationSec || 0)
      dispatch(setProgressPct(pct))
      if (durationSec > 0) dispatch(setSeekToSec(targetSec))
    }

    function onVolumeChange(ev) {
      const val = Number(ev.target.value)
      dispatch(setVolume(val / 100))
    }

    function formatTrackTime(time) {
      if (!Number.isFinite(time)) return '0:00'
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60).toString().padStart(2, '0')
      return `${minutes}:${seconds}`
    }

    //helper to get finite number for the 'children' attribute (without helper there is error in console)
    const safeNum = (num) => (Number.isFinite(num) ? num : 0)

    return (
        <footer className="app-footer full">
            <div className="player-left">
                <div className="cover" aria-hidden="true">
                    {currentTrack?.imgUrl ? <img src={currentTrack.imgUrl} alt='Cover' loading="lazy"/> : 'Cover'}
                </div>
                <div className="mini-track">
                    <div className="title">{currentTrack?.title || 'Track title'}</div>
                    <div className="artist">{currentTrack?.artist || 'Artist name'}</div>
                </div>
                <div className="btn-like">
                    <button
                        className="btn-mini-liked"
                        aria-checked="false"
                        aria-label="Add to Liked Songs"
                    >
                        <SvgIcon
                            iconName="addLikedSong"
                            className="liked-icon"
                        />
                        <SvgIcon
                            iconName="doneLikedSong"
                            className="liked-icon is-on"
                        />
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
                    <button
                        type="button"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        onClick={onPlayClick}
                        disabled={!currentTrack?.youtubeId}
                    >
                        {isPlaying ? (
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
                    <span className="time-zero">
                        {formatTrackTime(safeNum((progressPct / 100) * (durationSec || 0)))}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                            Number.isFinite(progressPct)
                                ? Math.round(progressPct)
                                : 0
                        }
                        onChange={onSeekChange}
                        aria-label="Seek"
                    />
                    <span className="time-end">
                        {formatTrackTime(safeNum(durationSec))}
                    </span>
                </div>
            </div>

            <div className="player-right">
                <div className="volume">
                    <SvgIcon iconName="volume" className="volume" />
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((volume ?? 0.8) * 100)}
                        onChange={onVolumeChange}
                        aria-label="Volume"
                    />
                </div>
            </div>
        </footer>
    )
}

//  <button
//                       onClick={() => onPlayPause(playlist[0])}
//                       aria-label="Play"
//                   >
//                       {isPlaylistPlaying() ? (
//                           <SvgIcon iconName="pause" className="pause" />
//                       ) : (
//                           <SvgIcon iconName="play" className="play" />
//                       )}
//                   </button>
