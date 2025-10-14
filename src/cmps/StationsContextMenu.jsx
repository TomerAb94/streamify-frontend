import { SvgIcon } from './SvgIcon'

export function StationsContextMenu({ stations, track }) {
  function isTrackInStation(track, station) {
    return station.tracks.some((t) => t.spotifyId === track.spotifyId)
  }

  return (
    <div
      className="stations-context-menu context-menu"
      onClick={(e) => e.stopPropagation()}
    >
      <form className="stations-form" action="">
        <header className="stations-form-header">
          <span>Add to playlist</span>
        </header>
        <div className="find-station">
          <span className="search-input-wrapper">
            <SvgIcon iconName="search" className="search-icon" />
            <input type="text" placeholder="Find a playlist" />
          </span>
        </div>
        <ul className="stations-list-menu">
          <button className="create-station-btn">
            <SvgIcon iconName="create" className="add-icon" />
            <span>New playlist</span>
          </button>
          {stations.map((station) => (
            <li className="add-to-station-container" key={station.id}>
              <button className="add-to-station-btn">
                <div className="mini-station">
                  <div className="station-img-wrapper">
                    {station.stationImgUrl ? (
                      <img
                        src={station.stationImgUrl}
                        alt="station cover"
                        className="station-img"
                      />
                    ) : (
                      <div className="station-placeholder-img">
                        <SvgIcon iconName="musicNote" />
                      </div>
                    )}
                  </div>
                  <span className="station-title">{station.title}</span>
                </div>

                <div className="symbols-container">
                  {station.isPinned && (
                    <SvgIcon iconName="pin" className="pin-icon" />
                  )}
                  {isTrackInStation(track, station) ? (
                    <SvgIcon iconName="inStation" className="in-station-icon" />
                  ) : (
                    <span className="empty-circle"></span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <footer className="stations-form-footer">
          <button className="cancel-btn">Cancel</button>
          <button className="done-btn">Done</button>
        </footer>
      </form>
    </div>
  )
}
