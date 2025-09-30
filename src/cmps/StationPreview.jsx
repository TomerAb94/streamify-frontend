import { Link } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'

export function StationPreview({ station }) {
  // station.isPinned = true
  const handlePlayClick = () => {
    console.log(`Play playlist: ${station.title}`)
  }

  return (
    <article className="station-preview">
      <div className="station-img-container">
        <img
          className="station-img"
          src={station.stationImgUrl}
          alt={`${station.title} Cover`}
        />
        <div className="play-overlay">
          <button className="play-btn" onClick={handlePlayClick}>
            <SvgIcon iconName="play" />
          </button>
        </div>
      </div>

      <div className="station-data-container">
        <p className="station-title">{station.title}</p>
        <div className="station-mini-data">
          {station.isPinned && (
              <SvgIcon iconName="stationPin" />
          )}
          <span className="station-type-owner">
            <span className="station-type">{station.stationType}</span>
            <span>{station.createdBy.fullname}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
