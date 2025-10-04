import { useState, useEffect, useRef } from 'react'

import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'
import { ModalEdit } from './ModalEdit.jsx'
import { StationListActions } from './StationListActions.jsx'
import { SortMenu } from './SortMenu.jsx'
import { debounce } from '../services/util.service'

export function StationList({
  onAddStation,
  stations,
  onRemoveStation,
  onUpdateStation,
}) {
  const [stationsToShow, setStationsToShow] = useState(stations)
  const [filterBy, setFilterBy] = useState({
    sortBy: 'Recently Added',
  })

  const [clickedStationId, setClickedStationId] = useState(null) //Click
  const [activeStationId, setActiveStationId] = useState(null) //Right Click
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 }) //For action menu Right Click

  const [isModalEditOpen, setIsModalEditOpen] = useState(false)
  const [stationToEdit, setStationToEdit] = useState(null)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

  useEffect(() => {
    filterStations()
  }, [stations, filterBy])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target) &&
        !event.target.closest('.sort-btn')
      ) {
        setIsSortMenuOpen(false)
      }
    }

    if (isSortMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isSortMenuOpen])

  const searchInputRef = useRef(null)
  const sortMenuRef = useRef(null)

  function filterStations() {
    let filteredStations = [...stations]

    if (filterBy.txt) {
      const regex = new RegExp(filterBy.txt, 'i')
      filteredStations = filteredStations.filter((station) =>
        regex.test(station.title)
      )
    }

    if (filterBy.sortBy === 'Recently Added') {
      filteredStations.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    if (filterBy.sortBy === 'Alphabetical') {
      filteredStations.sort((a, b) => a.title.localeCompare(b.title))
    }

    filteredStations.sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0
      return a.isPinned ? -1 : 1
    })

    setStationsToShow(filteredStations)
  }

  function handleInput(ev) {
    const txt = ev.target.value
    debounce(() => setFilterBy((prev) => ({ ...prev, txt })), 300)()
  }

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

  function onFocusInput() {
    searchInputRef.current.focus()
  }

  function toggleSortMenu(ev) {
    ev.stopPropagation()
    setIsSortMenuOpen(!isSortMenuOpen)
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
          <button onClick={onFocusInput} type="button" className="search-btn">
            <SvgIcon iconName="search" className="search-icon" />
          </button>
          <div className="input-container">
            <SvgIcon iconName="search" className="search-icon" />
            <input
              type="text"
              placeholder="Search in Your Library"
              onInput={handleInput}
              ref={searchInputRef}
            />
          </div>
          <button onClick={toggleSortMenu} className="sort-btn" type="button">
            <span className="sort-title">{filterBy.sortBy}</span>
            <SvgIcon iconName="defaultList" className="list-icon" />
          </button>
          <div
            className={`context-menu ${isSortMenuOpen ? 'open' : ''}`}
            ref={sortMenuRef}
          >
            <SortMenu setFilterBy={setFilterBy} />
          </div>
        </div>

        {stationsToShow.length === 0 && (
          <div className="no-stations">
            <h1>Couldn't find "{filterBy.txt}"</h1>
            <p>Try searching again using different spelling or keyword.</p>
          </div>
        )}

        <ul className="station-list">
          {stationsToShow.map((station) => (
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
        stations={stationsToShow}
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
