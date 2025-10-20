import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

export function StationPreview({ station, onPlayStation, onPause }) {
  // Use the new player state
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const currentStationId = useSelector(
    (storeState) => storeState.trackModule.currentStationId
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

  // Check if this specific station is currently playing
  function isStationPlaying() {
    if (!currentTrack || !station.tracks || !currentStationId) return false
    return currentStationId === station._id && 
           station.tracks.some(
             (track) => track.spotifyId === currentTrack.spotifyId
           ) && 
           isPlaying
  }

  function isActiveStation() {
    return currentStationId === station._id
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
        <div className="station-data-wrapper">
          <p className={`station-title ${isActiveStation() ? 'active-station' : ''}`}>
            {station.title}
          </p>
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
        <SvgIcon
          iconName="volumeFull"
          className={`${isStationPlaying() ? 'playing' : ''}`}
        />
      </div>
    </>
  )
}
