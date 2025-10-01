import { useState } from 'react'

import { userService } from '../services/user'
import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'

export function StationList({
  onAddStation,
  stations,
  onRemoveStation,
  onUpdateStation,
}) {
  const [clickedStationId, setClickedStationId] = useState(null) //Click
  const [activeStationId, setActiveStationId] = useState(null) //Right Click
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 }) //For action menu Right Click

  function toggleActionMenu(ev, stationId) {
    ev.preventDefault()
    setActionPosition({ x: ev.pageX, y: ev.pageY })
    setActiveStationId((prev) => (prev === stationId ? null : stationId))
  }

  function handlePlayClick(station) {
    console.log(`Play playlist: ${station.title}`)
    setClickedStationId(station._id)
  }

  function togglePin(ev, station) {
    ev.preventDefault()
    station.isPinned = !station.isPinned
    onUpdateStation(station)
  }

  return (
    <section
      className="station-list-container"
      onClick={() => setActiveStationId(null)}
    >
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
            <li
              key={station._id}
              className={`station-preview ${
                clickedStationId === station._id ? 'clicked' : ''
              }`}
              onClick={() => handlePlayClick(station)}
              onContextMenu={(ev) => toggleActionMenu(ev, station._id)}
            >
              <StationPreview station={station} />

              {activeStationId === station._id && (
                <ul
                  className="action-menu"
                  style={{
                    position: 'fixed',
                    left: `${actionPosition.x}px`,
                    top: `${actionPosition.y}px`,
                  }}
                >
                  <li>
                    <button
                      className="action-btn no-background "
                      onClick={() => onRemoveStation(station._id)}
                    >
                      <SvgIcon iconName="profile" />{' '}
                      <span>Remove from profile</span>
                    </button>
                  </li>

                  <li>
                    <button
                      className="action-btn no-background"
                      onClick={(ev) => togglePin(ev, station)}
                    >
                      {station.isPinned ? (
                        <>
                          <SvgIcon iconName="pin" />
                          <span>Unpin playlist</span>
                        </>
                      ) : (
                        <>
                          <SvgIcon iconName="pinNoFill" />
                          <span>Pin playlist</span>
                        </>
                      )}
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </form>
    </section>
  )
}
