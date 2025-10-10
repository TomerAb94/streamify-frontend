import { useState } from 'react'
import { SvgIcon } from './SvgIcon'

export function TrackList({ tracks, playlist, onPlay, onPause }) {
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)
  
  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }
  
  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }
  
  function formatDuration(durationMs) {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  function getPlayingTrack() {
    if (!playlist || !playlist.length) return false
    const playingTrack = playlist.find((track) => track.isPlaying)
    console.log('Playing track from playlist:', playingTrack);
    return playingTrack ? playingTrack : false
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
          key={idx}
          onMouseEnter={() => handleMouseEnter(idx)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="track-num">
            {getPlayingTrack().isPlaying &&
            getPlayingTrack().spotifyId === track.spotifyId ? (
              <div className="track-num">
                {getPlayingTrack().isPlaying &&
                getPlayingTrack().spotifyId === track.spotifyId ? (
                  hoveredTrackIdx === idx ? (
                    <SvgIcon
                      iconName="pause"
                      className="pause"
                      onClick={() => onPause(getPlayingTrack())}
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

          <div className="track-title">
            {track.album?.imgUrl && (
              <img
                src={track.album.imgUrl}
                alt={`${track.name} cover`}
                className="track-img"
              />
            )}
            <div className="track-text">
              <span className="track-name">{track.name}</span>
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
              {formatDuration(track.duration)}
            </span>
          </div>
        </div>
      ))}
    </section>
  )
}
