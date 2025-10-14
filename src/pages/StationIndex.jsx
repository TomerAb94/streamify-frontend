import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'

import {
  loadStations,
  addStation,
  updateStation,
  removeStation,
} from '../store/actions/station.actions'

import { updateUser } from '../store/actions/user.actions'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { stationService } from '../services/station/'

import { StationList } from '../cmps/StationList'
import { AppHeader } from '../cmps/AppHeader'
import { AppFooter } from '../cmps/AppFooter'
import { ModalRemove } from '../cmps/ModalRemove'
import { PlaylistQueue } from '../cmps/PlaylistQueue'
import { NowPlayingView } from '../cmps/NowPlayingView'
import { setCurrentTrack, setIsPlaying } from '../store/actions/track.actions'

export function StationIndex() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const [isModalRemoveOpen, setIsModalRemoveOpen] = useState(false)
  const [stationToRemove, setStationToRemove] = useState(null)
  const [openPanel, setOpenPanel] = useState(null)
  
  const navigate = useNavigate()

  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const station = useSelector((storeState) => storeState.stationModule.station)
  const loggedInUser = useSelector((storeState) => storeState.userModule.user)
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

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

  async function onAddStation(ev) {
    ev.stopPropagation()
    ev.preventDefault()
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
      navigate(`station/${savedStation._id}`)
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
    setOpenPanel(prev => (prev === 'queue' ? null : 'queue'))
  }

  function onToggleNowPlaying() {
    setOpenPanel(prev => (prev === 'now' ? null : 'now'))
  }

  function closePanel() {
  setOpenPanel(null)
}

  async function onPlay(track) {
    try {
      await setCurrentTrack(track)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing track:', err)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }

  return (
    <section
      ref={mainContainerRef}
      className={`main-container ${openPanel ? 'sidebar-open' : ''}`}
    >
      <AppHeader />

      <StationList
        stations={stations}
        playlist={playlist}
        onAddStation={onAddStation}
        onRemoveStation={onRemoveStation}
        onUpdateStation={onUpdateStation}
      />

      <Outlet context={{ stations }} />

      <PlaylistQueue
        playlist={playlist}
        station={station}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onClose={closePanel}
        isOpen={openPanel === 'queue'}
      />

      <NowPlayingView
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onClose={closePanel}
        isOpen={openPanel === 'now'}
      />

      <AppFooter 
        onToggleQueue={onToggleQueue} 
        onToggleNowPlaying={onToggleNowPlaying} 
        isQueueOpen={openPanel === 'queue'} 
        isNowOpen={openPanel === 'now'}
        onAddStation={onAddStation}
      />

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
