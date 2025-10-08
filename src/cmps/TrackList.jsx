import { useState } from 'react'
import { SvgIcon } from './SvgIcon'

export function TrackList({
  tracks,
  onPlay,
}) {

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

  return (
    <table className="track-list">
      <thead>
        <tr className="table-header">
          <th className="table-header-text">#</th>
          <th className="table-header-text">Title</th>
          <th className="table-header-text">Album</th>
          <th className="table-header-text">
            <SvgIcon iconName="duration" className="duration" />
          </th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, idx) => (
          <tr
            className="track-preview"
            key={track.spotifyId}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={() => handleMouseLeave()}
          >
            {hoveredTrackIdx === idx ? (
              <td className="track-fast-play" onClick={() => onPlay(track)}>
                {' '}
                <SvgIcon iconName="play" className="play" />
              </td>
            ) : (
              <td className="track-num">{idx + 1}</td>
            )}

            <td className="track-title-cell">
              <div className="track-info">
                {track.album?.imgUrl && (
                  <img
                    src={track.album.imgUrl}
                    alt={`${track.album.name} cover`}
                    className="track-img"
                  />
                )}
                <div className="track-text">
                  <span className="track-name">{track.name}</span>
                  <span className="track-artists">
                    {track.artists.map((artist, i) => (
                      <span key={artist.id}>
                        {artist.name}
                        {i < track.artists.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </td>
            <td className="track-album-cell">{track.album?.name}</td>
            <td className="track-duration">{formatDuration(track.duration)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
