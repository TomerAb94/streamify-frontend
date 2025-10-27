import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { StationPreview } from './StationPreview'
import { SvgIcon } from './SvgIcon'
import { ModalEdit } from './ModalEdit.jsx'
import { StationListActions } from './StationListActions.jsx'
import { SortMenu } from './SortMenu.jsx'
import { debounce } from '../services/util.service'
import {
  setTracks,
  setCurrentTrack,
  setCurrentStationId,
  setIsPlaying,
} from '../store/actions/track.actions.js'
import { youtubeService } from '../services/youtube.service.js'

export function StationList({
  stations,
  playlist,
  onAddStation,
  onRemoveStation,
  onUpdateStation,
}) {
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

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

    filteredStations.sort((a, b) => {
      if (a.tags.includes('Liked Songs') && !b.tags.includes('Liked Songs'))
        return -1
      if (!a.tags.includes('Liked Songs') && b.tags.includes('Liked Songs'))
        return 1
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

  function handlePlayClick(stationId) {
    setClickedStationId(stationId)
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

  async function onPlay(track, station) {
    try {
      // Set the current station ID
      setCurrentStationId(station._id)
      
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      // Build the playlist queue with navigation IDs and YouTube IDs
      const playlistQueue = await Promise.all(
        station.tracks.map(async (track, index) => {
          return {
            ...track,
            nextId:
              index < station.tracks.length - 1
                ? station.tracks[index + 1].spotifyId
                : station.tracks[0].spotifyId,
            prevId:
              index > 0
                ? station.tracks[index - 1].spotifyId
                : station.tracks[station.tracks.length - 1].spotifyId,
            youtubeId: await getYoutubeId(track.name),
          }
        })
      )

      // Set the playlist in the store
      await setTracks(playlistQueue)

      // Find the track to play and set it as current
      const trackToPlay = playlistQueue.find(
        (t) => t.spotifyId === track.spotifyId
      )
      if (trackToPlay) {
        setCurrentTrack(trackToPlay)
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing track:', err)
    }
  }

  function onPause() {
    // Simply pause - don't change the current track
    setIsPlaying(false)
  }

  function onResume() {
    // Just resume playing the current track
    setIsPlaying(true)
  }

  function isStationCurrentlySelected(station) {
    if (!currentTrack || !station || !station.tracks) return false
    return station.tracks.some(
      (track) => track.spotifyId === currentTrack.spotifyId
    )
  }

  async function onPlayStation(station) {
    // If there's a current track from this station that's paused, just resume
    if (currentTrack && isStationCurrentlySelected(station) && !isPlaying) {
      onResume()
    } else {
      // Otherwise start playing from first track
      await onPlay(station.tracks[0], station)
    }
  }

  async function getYoutubeId(str) {
    // console.log('Getting YouTube ID for:', str)
    try {
      const res = await youtubeService.getYoutubeItems(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  return (
    <section
      className="station-list-container"
      onClick={() => setActiveStationId(null)}
    >
      <header>
        <h3>Your Library</h3>
        <button className="create-btn" onClick={(ev) => onAddStation(ev)}>
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
            <NavLink to={`/station/${station._id}`} key={station._id}>
              <li
                className={`station-preview ${
                  clickedStationId === station._id ? 'clicked' : ''
                }`}
                onClick={() => handlePlayClick(station._id)}
                onContextMenu={(ev) => toggleActionMenu(ev, station._id)}
              >
                <StationPreview
                  station={station}
                  onPlayStation={onPlayStation}
                  onPause={onPause}
                />
              </li>
            </NavLink>
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
