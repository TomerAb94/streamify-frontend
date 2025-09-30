import { Link } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'

export function StationPreview({ station }) {
  station.isPinned = true
  return (
    <article className="station-preview">
      <div className="station-img-container">
        <img
          className="station-img"
          src={station.stationImgUrl}
          alt="Playlist Img"
        />
      </div>

      <div className="station-data-container">
        <p className="station-title">{station.title}</p>
        <div className="station-mini-data">
          {station.isPinned && (
            <span>
              <SvgIcon iconName="stationPin" />
            </span>
          )}
          <span className="station-type-owner">
            {station.stationType} • {station.createdBy.fullname}
          </span>
        </div>
      </div>
    </article>
  )
}
