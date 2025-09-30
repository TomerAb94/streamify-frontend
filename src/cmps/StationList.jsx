import { userService } from '../services/user'
import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'

export function StationList({
  onAddStation,
  stations,
  onRemoveStation,
  onUpdateStation,
}) {
  function shouldShowActionBtns(station) {
    const user = userService.getLoggedinUser()

    if (!user) return false
    if (user.isAdmin) return true
    return station.owner?._id === user._id
  }

  return (
    <section className="station-list-container">
      <header>
        <h3>Your Library</h3>
        <button className="create-btn" onClick={() => onAddStation()}>
          <span className="create-icon">
            <SvgIcon iconName="create" />
          </span>
          Create
        </button>
      </header>

      <div className="station-labels">
        <button>Playlists</button>
        <button>Artists</button>
        <button>Albums</button>
      </div>

      <form className="station-list-form">
        <div className="search-bar">
          <input type="text" placeholder="Search in your library" />
          <button>sort by</button>
        </div>

        <ul className="station-list">
          {stations.map((station) => (
            <li key={station._id}>
              <StationPreview station={station} />
              {/* {shouldShowActionBtns(station) && (
                <div className="actions">
                  <button onClick={() => onUpdateStation(station)}>Edit</button>
                  <button onClick={() => onRemoveStation(station._id)}>
                    x
                  </button>
                </div>
              )} */}
            </li>
          ))}
        </ul>
      </form>
    </section>
  )
}
