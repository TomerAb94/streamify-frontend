import { useState } from 'react'

import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'
import { ModalEdit } from './ModalEdit.jsx'
import { StationListActions } from './StationListActions.jsx'

export function StationList({
  onAddStation,
  stations,
  onRemoveStation,
  onUpdateStation,
}) {
  const [clickedStationId, setClickedStationId] = useState(null) //Click
  const [activeStationId, setActiveStationId] = useState(null) //Right Click
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 }) //For action menu Right Click
  const [isModalEditOpen, setIsModalEditOpen] = useState(false)
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

  function openModalEdit() {
    setIsModalEditOpen(true)
    setStationToEdit(
      stations.find((station) => station._id === activeStationId)
    )
  }

  function closeModal() {
    setIsModalEditOpen(false)
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

      <StationListActions
        stations={stations}
        activeStationId={activeStationId}
        actionPosition={actionPosition}
        onAddStation={onAddStation}
        onRemoveStation={onRemoveStation}
        onUpdateStation={onUpdateStation}
        onOpenModalEdit={openModalEdit}
        onClose={() => setActiveStationId(null)}
      />

      {isModalEditOpen && (
        <ModalEdit
          station={stationToEdit}
          isModalEditOpen={isModalEditOpen}
          closeModal={closeModal}
          updateStation={onUpdateStation}
        ></ModalEdit>
      )}
      
    </section>
  )
}
