import { useState } from 'react'

import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'
import { ModalEdit } from './ModalEdit.jsx'

export function StationList({
  onAddStation,
  stations,
  onRemoveStation,
  onUpdateStation,
}) {
  const [clickedStationId, setClickedStationId] = useState(null) //Click
  const [activeStationId, setActiveStationId] = useState(null) //Right Click
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 }) //For action menu Right Click
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stationToEdit, setStationToEdit] = useState(null)

  function toggleActionMenu(ev, stationId) {
    ev.preventDefault()
    ev.stopPropagation()

    setActionPosition({ x: ev.pageX, y: ev.pageY })
    setActiveStationId((prev) => (prev === stationId ? null : stationId))
  }

  function handlePlayClick(station) {
    console.log(`Play playlist: ${station.title}`)
    setClickedStationId(station._id)
    setActiveStationId(null)
  }

  function togglePin(station) {
    station.isPinned = !station.isPinned
    onUpdateStation(station)
    setActiveStationId(null)
  }

  function openModal() {
    setIsModalOpen(true)
    setStationToEdit(stations.find(station => station._id === activeStationId))
    setActiveStationId(null)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  function handleRemoveStation(stationId) {
    onRemoveStation(stationId)
    setActiveStationId(null)
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
            </li>
          ))}
        </ul>
      </form>

      {activeStationId && (
        <div
          className="action-menu-container"
          style={{
            position: 'fixed',
            left: `${actionPosition.x}px`,
            top: `${actionPosition.y}px`,
            zIndex: 1000,
          }}
        >
          <ul className="action-menu">
            <li>
              <button
                className="action-btn no-background"
                onClick={() => openModal()}
              >
                <SvgIcon iconName="edit" /> <span>Edit details</span>
              </button>
            </li>

            <li>
              <button
                className="action-btn no-background"
                onClick={() => handleRemoveStation(activeStationId)}
              >
                <SvgIcon iconName="delete" /> <span>Delete</span>
              </button>
            </li>

            <div className="spacer"></div>

            <li>
              <button
                className="action-btn no-background"
                onClick={() => onAddStation()}
              >
                <SvgIcon iconName="musicNote" /> <span>Create playlist</span>
              </button>
            </li>

            <li>
              <button
                className="action-btn no-background"
                onClick={() => {
                  const station = stations.find(
                    (s) => s._id === activeStationId
                  )
                  togglePin(station)
                }}
              >
                {stations.find((s) => s._id === activeStationId)?.isPinned ? (
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
        </div>
      )}

      {isModalOpen && (
        <ModalEdit station={stationToEdit} isModalOpen={isModalOpen} closeModal={closeModal} updateStation={onUpdateStation}>
          
        </ModalEdit>
      )}
    </section>
  )
}
