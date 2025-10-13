import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'
import { NavLink } from 'react-router-dom'

export function TrackList({ tracks, onPlay, onPause }) {
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)
  
  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }
  
  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  
  function isTrackCurrentlyPlaying(track) {
    return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
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
          className="track-row"
          key={track.spotifyId ? `${track.spotifyId}-${idx}` : `track-${idx}`}
          onMouseEnter={() => handleMouseEnter(idx)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`track-num ${currentTrack && currentTrack.spotifyId === track.spotifyId ? 'playing' : ''}`}>
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

          <div className={`track-title ${currentTrack && currentTrack.spotifyId === track.spotifyId ? 'playing' : ''}`}>
            {track.album?.imgUrl && (
              <img
                src={track.album.imgUrl}
                alt={`${track.name} cover`}
                className="track-img"
              />
            )}
            <div className="track-text">
              <NavLink to={`/track/${track.spotifyId}`} className="track-name nav-link">{track.name}</NavLink>
              <div className="track-artists">
                {track.artists.map((artist, i) => (
                  <span key={artist.id}>
                    {artist.name}
                    {i < track.artists.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="track-album">{track.album?.name}</div>
          <div className="track-duration-container">
            <span className="track-duration">
              {track.duration}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
