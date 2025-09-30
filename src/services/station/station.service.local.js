import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { userService } from '../user'

const STORAGE_KEY = 'station'

export const stationService = {
  query,
  getById,
  save,
  remove,
  addStationMsg,
}
window.cs = stationService

async function query(filterBy = { txt: '' }) {
  var stations = await storageService.query(STORAGE_KEY)
  const { txt, sortField, sortDir } = filterBy

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    stations = stations.filter(
      (station) => regex.test(station.title) || regex.test(station.description)
    )
  }
  if (sortField === 'title') {
    stations.sort(
      (station1, station2) =>
        station1[sortField].localeCompare(station2[sortField]) * +sortDir
    )
  }
  if (sortField === '') {
    stations.sort(
      (station1, station2) =>
        (station1[sortField] - station2[sortField]) * +sortDir
    )
  }

  // stations = stations.map(({ _id, title }) => ({ _id, title }))  
  return stations
}

function getById(stationId) {
  return storageService.get(STORAGE_KEY, stationId)
}

async function remove(stationId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, stationId)
}

async function save(station) {
  console.log('station', station)

  var savedStation
  if (station._id) {
    const stationToSave = {
      _id: station._id,
    }
    savedStation = await storageService.put(STORAGE_KEY, stationToSave)
  } else {
    const stationToSave = {
      title: station.title,
      tages: station.tags,
      stationImgUrl: station.stationImgUrl,
      createdBy: userService.getLoggedinUser(), // Later, owner is set by the backend
      likedByUsers: station.likedByUsers,
      isPinned: station.isPinned,
      stationType: station.stationType,
      songs: station.songs,
      reviews: station.reviews,
    }
    savedStation = await storageService.post(STORAGE_KEY, stationToSave)
  }
  return savedStation
}

async function addStationMsg(stationId, txt) {
  // Later, this is all done by the backend
  const station = await getById(stationId)

  const msg = {
    id: makeId(),
    by: userService.getLoggedinUser(),
    txt,
  }
  station.msgs.push(msg)
  await storageService.put(STORAGE_KEY, station)

  return msg
}
