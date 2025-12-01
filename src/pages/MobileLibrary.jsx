import { useSelector } from 'react-redux'
import { StationList } from '../cmps/StationList'
import { loadStations, addStation, updateStation, removeStation } from '../store/actions/station.actions'
import { useNavigate } from 'react-router'
export function MobileLibrary() {
  const stations = useSelector((storeState) => storeState.stationModule.stations)
  const station = useSelector((storeState) => storeState.stationModule.station)
  const loggedInUser = useSelector((storeState) => storeState.userModule.user)
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
    const navigate = useNavigate()
  async function onAddStation(ev) {
    ev.preventDefault()
    if (!loggedInUser) {
      showErrorMsg('You must be logged in to add a station')
      return
    }
    const playlistStations = stations.filter((station) => station.stationType === 'playlist')
    const count = playlistStations.length + 1
    const station = stationService.getEmptyStation()
    station.title += count
    try {
      const savedStation = await addStation(station)
      console.log('Station added:', savedStation)
      navigate(`station/${savedStation._id}`)

      // loggedInUser.ownedStationIds = loggedInUser.ownedStationIds || []
      loggedInUser.ownedStationIds.push(savedStation._id)
      const savedUser = await updateUser(loggedInUser)

      // showSuccessMsg(`Station added (id: ${savedStation._id})`)
    } catch (err) {
      // showErrorMsg('Cannot add station', err)
      console.log('err:', err)
    }
  }

  function onRemoveStation(stationId) {
    if (!loggedInUser) {
      showErrorMsg('You must be logged in to remove a station')
      return
    }

    const station = stations.find((s) => s._id === stationId)
    setStationToRemove(station)
    setIsModalRemoveOpen(true)
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

    async function onAddStation(ev) {
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
        console.log('Station added:', savedStation)
        navigate(`station/${savedStation._id}`)
        
        // loggedInUser.ownedStationIds = loggedInUser.ownedStationIds || []
        loggedInUser.ownedStationIds.push(savedStation._id)
        const savedUser = await updateUser(loggedInUser)
       
        // showSuccessMsg(`Station added (id: ${savedStation._id})`)
      } catch (err) {
        // showErrorMsg('Cannot add station', err)
        console.log('err:', err)
      }
    }

  return (
    <div className="mobile-library-container">
      <StationList
        stations={stations}
        playlist={playlist}
        onAddStation={onAddStation}
        onRemoveStation={onRemoveStation}
        onUpdateStation={onUpdateStation}
      />
    </div>
  )
}
