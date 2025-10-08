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

export var stationsCount

async function query(filterBy = { txt: '' }) {
  var stations = await storageService.query(STORAGE_KEY)
  const { txt, loggedinUser, sortField, sortDir } = filterBy
  if (!loggedinUser) return []

  if (loggedinUser) {
    stations = stations.filter(
      (station) => station.createdBy._id === loggedinUser._id
    )
  }

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
  var savedStation
// console.log(station)

  let stationToSave = {
    title: station.title,
    tags: station.tags,
    stationImgUrl: station.stationImgUrl,
    createdBy: userService.getLoggedinUser(), // Later, owner is set by the backend
    likedByUsers: station.likedByUsers,
    isPinned: station.isPinned,
    stationType: station.stationType,
    tracks: station.tracks,
    reviews: station.reviews,
    description: station.description,
    createdAt: station.createdAt
  }

  if (station._id) {
    ;(stationToSave._id = station._id),
      (savedStation = await storageService.put(STORAGE_KEY, stationToSave))
  } else {
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
