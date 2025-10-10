import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import ReactPlayer from 'react-player'

import { spotifyService } from '../services/spotify.service'

import {
  loadStations,
  addStation,
  updateStation,
  removeStation,
  addStationMsg,
} from '../store/actions/station.actions'

import { updateUser } from '../store/actions/user.actions'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { stationService } from '../services/station/'
import { userService } from '../services/user'

import { StationList } from '../cmps/StationList'
import { StationFilter } from '../cmps/StationFilter'
import { AppHeader } from '../cmps/AppHeader'
import { AppFooter } from '../cmps/AppFooter'
import { ModalRemove } from '../cmps/ModalRemove'
import { trackService } from '../services/track/index'
import { TrackPreview } from '../cmps/TrackPreview'
import { SvgIcon } from '../cmps/SvgIcon'

export function StationIndex() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const [isModalRemoveOpen, setIsModalRemoveOpen] = useState(false)
  const [stationToRemove, setStationToRemove] = useState(null)

  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const loggedInUser = useSelector((storeState) => storeState.userModule.user)
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)

  const queueRef = useRef(null)
  const mainContainerRef = useRef(null)

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

  function onRemoveStation(stationId) {
    if (!loggedInUser) {
      showErrorMsg('You must be logged in to remove a station')
      return
    }

    const station = stations.find((s) => s._id === stationId)
    setStationToRemove(station)
    setIsModalRemoveOpen(true)
  }

  async function onConfirmRemove(stationId) {
    try {
      await removeStation(stationId)
      loggedInUser.ownedStationIds.splice(
        loggedInUser.ownedStationIds.indexOf(stationId),
        1
      )
      const savedUser = await updateUser(loggedInUser)
      showSuccessMsg('Station removed')
    } catch (err) {
      showErrorMsg('Cannot remove station')
    }
  }

  function closeModal() {
    setIsModalRemoveOpen(false)
    setStationToRemove(null)
  }

  async function onAddStation() {
    if (!loggedInUser) {
      showErrorMsg('You must be logged in to add a station')
      return
    }
    const playlistStations = stations.filter(
      (station) => station.stationType === 'playlist'
    )
    const count = playlistStations.length + 1
    const station = stationService.getEmptyStation()
    station.title += count
    try {
      const savedStation = await addStation(station)
      loggedInUser.ownedStationIds.push(savedStation._id)
      const savedUser = await updateUser(loggedInUser)

      showSuccessMsg(`Station added (id: ${savedStation._id})`)
    } catch (err) {
      showErrorMsg('Cannot add station')
    }
  }

  async function onUpdateStation(station) {
    const stationToSave = { ...station }

    try {
      const savedStation = await updateStation(stationToSave)
      showSuccessMsg(`Station updated, new pin: ${savedStation.isPinned}`)
    } catch (err) {
      showErrorMsg('Cannot update station')
    }
  }

  function onToggleQueue() {
    queueRef.current.classList.toggle('open')
    mainContainerRef.current.classList.toggle('sidebar-open')
  }

  // async function onAddTrack() {
  //   const track = trackService.getEmptyTrack()
  //   console.log(track)

  //   try {
  //   } catch (err) {
  //     showErrorMsg('Cannot update station')
  //   }
  // }

  return (
    <section ref={mainContainerRef} className="main-container">
      <AppHeader />

      <StationList
        stations={stations}
        onAddStation={onAddStation}
        onRemoveStation={onRemoveStation}
        onUpdateStation={onUpdateStation}
      />

      <Outlet context={{ stations }} />

      <div ref={queueRef} className="queue">
        <header>
          <h1>Queue</h1>
          <button onClick={onToggleQueue}>
            <SvgIcon iconName="close" />
          </button>
        </header>
        <div className="queue-track-list">
          <div className='track-area'>
            <h2>Now playing</h2>
            {playlist.map((track, idx) => {
              if (track.isPlaying) {
                return (
                  <TrackPreview
                    track={track}
                    idx={idx}
                    isPlaying={track.isPlaying}
                  />
                )
              }
            })}
          </div>
          <div className='track-area'>
            <h2>Next:</h2>
            {playlist.map((track, idx) => (
              <TrackPreview
                track={track}
                idx={idx}
                isPlaying={track.isPlaying}
              />
            ))}
          </div>
        </div>
      </div>

      <AppFooter onToggleQueue={onToggleQueue} />
      {isModalRemoveOpen && (
        <ModalRemove
          station={stationToRemove}
          isModalRemoveOpen={isModalRemoveOpen}
          closeModal={closeModal}
          onConfirmRemove={onConfirmRemove}
        />
      )}
    </section>
  )
}
