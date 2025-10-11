import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

export function StationPreview({ station, onPlay, onPlayStation, onPause }) {
  // Use the new player state
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)

  // Check if any track from this station is currently playing
  function isStationPlaying() {
    if (!currentTrack) return false
    return station.tracks.some(track => track.spotifyId === currentTrack.spotifyId) && isPlaying
  }

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
          {isStationPlaying() ? (
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onPause()
              }}
              className="play-btn"
            >
              <SvgIcon iconName="pause" className="pause" />
            </div>
          ) : (
            <div
              className="play-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onPlayStation(station)
              }}
            >
              <SvgIcon iconName="play" />
            </div>
          )}
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
