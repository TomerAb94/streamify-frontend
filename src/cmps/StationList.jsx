import { userService } from '../services/user'
import { StationPreview } from './StationPreview'

export function StationList({ stations, onRemoveStation, onUpdateStation }) {
  function shouldShowActionBtns(station) {
    const user = userService.getLoggedinUser()

    if (!user) return false
    if (user.isAdmin) return true
    return station.owner?._id === user._id
  }

  return (
    <section className="station-list-container">
      <header>
        <h3>Your Libary</h3>
        <button>+</button>
      </header>

      <div className="station-labels">
        <button>Playlists</button>
        <button>Artists</button>
        <button>Albums</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search in your libary" />
        <button>sort by</button>
      </div>

      <ul className="station-list">
        <li>liked songs</li>
        <li>recently played</li>
        <li>your playlists</li>
        {/* {stations.map(station =>
                <li key={station._id}>
                    <StationPreview station={station}/>
                    {shouldShowActionBtns(station) && <div className="actions">
                        <button onClick={() => onUpdateStation(station)}>Edit</button>
                        <button onClick={() => onRemoveStation(station._id)}>x</button>
                    </div>}
                </li>)
            } */}
      </ul>
    </section>
  )
}
