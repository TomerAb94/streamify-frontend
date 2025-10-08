import { useState } from 'react'
import { SvgIcon } from './SvgIcon'

export function StationPreview({ station }) {
  return (
    <>
      <div className="station-img-container">
        {station.stationImgUrl ? (
          <img
            className="station-img"
            src={station.stationImgUrl}
            alt={`${station.title} Cover`}
          />
        ) : (
          <div className="station-img-placeholder">
            <SvgIcon iconName="musicNote" />
          </div>
        )}

        <div className="play-overlay">
          <div className="play-btn">
            <SvgIcon iconName="play" />
          </div>
        </div>
      </div>

      <div className="station-data-container">
        <p className="station-title">{station.title}</p>
        <div className="station-mini-data">
          {station.isPinned && <SvgIcon iconName="pin" />}
          <span className="station-type-owner">
            <span className="station-type">{station.stationType}</span>
            {station.tags.includes('Liked Songs') ? (
              <span> {station.tracks.length} songs </span>
            ) : (
              <span>{station.createdBy.fullname}</span>
            )}
          </span>
        </div>
      </div>
    </>
  )
}
