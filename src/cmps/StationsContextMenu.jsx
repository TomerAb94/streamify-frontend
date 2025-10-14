import { SvgIcon } from './SvgIcon'

export function StationsContextMenu({ stations, track }) {
    
  function isTrackInStation(track, station) {
    return station.tracks.some((t) => t.spotifyId === track.spotifyId)
  }
  
  return (
    <div className="stations-context-menu context-menu">
      <form className="stations-form" action="">
        <header className="stations-form-header">
          <span>Add to playlist</span>
        </header>
        <div className="find-station">
          <input type="text" />
        </div>
        <ul className="stations-list-menu">
          <button>New playlist</button>
          {stations.map((station) => (
            <li key={station.id}>
              <button>
                <div>
                  {station.imgUrl ? (
                    <img
                      src={station.imgUrl}
                      alt="station cover"
                      className="station-img"
                    />
                  ) : (
                    <div className="station-placeholder-img">
                      <SvgIcon iconName="music" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="station-name">{station.name}</span>
                  <div>
                    {station.isPinned && (
                      <SvgIcon iconName="pin" className="pin-icon" />
                    )}
                    {isTrackInStation(track, station) ? (
                      <SvgIcon
                        iconName="inStation"
                        className="in-station-icon"
                      />
                    ) : (
                      <span className="empty-circle"></span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </form>
    </div>
  )
}
