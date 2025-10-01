import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'

import {
  loadStations,
  addStation,
  updateStation,
  removeStation,
  addStationMsg,
} from '../store/actions/station.actions'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { stationService } from '../services/station/'
import { userService } from '../services/user'

import { StationList } from '../cmps/StationList'
import { StationFilter } from '../cmps/StationFilter'
import { AppHeader } from '../cmps/AppHeader'
import { AppFooter } from '../cmps/AppFooter'

export function StationIndex() {
  const [filterBy, setFilterBy] = useState(stationService.getDefaultFilter())
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )

  useEffect(() => {
    loadStations(filterBy)
  }, [filterBy])

  async function onRemoveStation(stationId) {
    try {
      await removeStation(stationId)
      showSuccessMsg('Station removed')
    } catch (err) {
      showErrorMsg('Cannot remove station')
    }
  }

  async function onAddStation() {
    const playlistStations = stations.filter(
      (station) => station.stationType === 'playlist'
    )
    const count = playlistStations.length + 1
    const station = stationService.getEmptyStation()
    station.title += count
    try {
      const savedStation = await addStation(station)
      // showSuccessMsg(`Station added (id: ${savedStation._id})`)
    } catch (err) {
      // showErrorMsg('Cannot add station')
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

  return (
    <section className="main-container">
      <AppHeader />

      <StationList
        stations={stations}
        onAddStation={onAddStation}
        onRemoveStation={onRemoveStation}
        onUpdateStation={onUpdateStation}
      />

      {/* <header>
        <h2>Stations</h2>
        {userService.getLoggedinUser() && (
          <button onClick={onAddStation}>Add a Station</button>
        )}
      </header> */}

      <Outlet context={stations} />

      {/* <StationFilter filterBy={filterBy} setFilterBy={setFilterBy} /> */}
      {/* <StationList  */}
      {/* stations={stations}
                onRemoveStation={onRemoveStation} 
                onUpdateStation={onUpdateStation}/> */}

      <AppFooter />
    </section>
  )
}
