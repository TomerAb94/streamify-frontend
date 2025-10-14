import { useState, useEffect } from 'react'
import { SvgIcon } from './SvgIcon'
import { debounce } from '../services/util.service'
import { use } from 'react'

export function StationsContextMenu({
  stations,
  track,
  onAddStation,
  onClose,
  onUpdateStations,
}) {
  const [filterBy, setFilterBy] = useState({ txt: '' })
  const [stationsToShow, setStationsToShow] = useState(stations)
  const [modifiedStations, setModifiedStations] = useState([])

  useEffect(() => {
    filterStations()
  }, [stations, filterBy])

  useEffect(() => {
    filterStations()
  }, [modifiedStations])

  function isTrackInStation(track, station) {
    return station.tracks.some((t) => t.spotifyId === track.spotifyId)
  }

  function filterStations() {
    let filteredStations = [...stations]

    // Filter by search text
    if (filterBy.txt) {
      const regex = new RegExp(filterBy.txt, 'i')
      filteredStations = filteredStations.filter((station) =>
        regex.test(station.title)
      )
    }

    // Sort by: 1. Track in station, 2. Pinned stations, 3. Alphabetical, 4. Created date
    filteredStations.sort((a, b) => {
      const aHasTrack = isTrackInStation(track, a)
      const bHasTrack = isTrackInStation(track, b)

      // First priority: stations that contain the track
      if (aHasTrack && !bHasTrack) return -1
      if (!aHasTrack && bHasTrack) return 1

      // Second priority: pinned stations
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      // Third priority: created date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    setStationsToShow(filteredStations)
  }

  function handleInput(ev) {
    const txt = ev.target.value
    debounce(() => setFilterBy((prev) => ({ ...prev, txt })), 300)()
  }

  function onAddToggleTrackInStation(ev, station) {
    ev.preventDefault()
    ev.stopPropagation()

    const stationToUpdate = { ...station }

    if (isTrackInStation(track, station)) {
      // Remove track
      stationToUpdate.tracks = stationToUpdate.tracks.filter(
        (t) => t.spotifyId !== track.spotifyId
      )
    } else {
      // Add track
      stationToUpdate.tracks = [...stationToUpdate.tracks, track]
    }

    setModifiedStations((prev) => {
      const otherStations = prev.filter((s) => s._id !== stationToUpdate._id)
      return [...otherStations, stationToUpdate]
    })
  }

  function onDone(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    onUpdateStations(modifiedStations)
    onClose(ev)
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
            <input
              type="text"
              placeholder="Find a playlist"
              onInput={handleInput}
            />
          </span>
        </div>
        <ul className="stations-list-menu">
          <button
            className="create-station-btn"
            onClick={(ev) => onAddStation(ev, track)}
          >
            <SvgIcon iconName="create" className="add-icon" />
            <span>New playlist</span>
          </button>
          {stationsToShow.map((station) => (
            <li className="add-to-station-container" key={station._id}>
              <button
                className="add-to-station-btn"
                onClick={(ev) => onAddToggleTrackInStation(ev, station)}
              >
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
                  {isTrackInStation(track, modifiedStations.find(s => s._id === station._id) || station) ? (
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
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="done-btn" onClick={(ev) => onDone(ev)}>
            Done
          </button>
        </footer>
      </form>
    </div>
  )
}
