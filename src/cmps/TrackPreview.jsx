import { useState } from 'react'

export function TrackPreview({ track, idx, playingClass }) {
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }
  return (
    <section
      className="track-preview"
      onMouseEnter={() => handleMouseEnter(idx)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="track-img">
        <img src={track.album?.imgUrl} alt={`${track.name} cover`} />
      </div>

      <div className="track-info">
        <span className={`track-name ${playingClass}`}>{track.name}</span>
        <span className="artist-name">{track.artists.map(artist => artist.name).join(', ')}</span>
      </div>
    </section>
  )
}
