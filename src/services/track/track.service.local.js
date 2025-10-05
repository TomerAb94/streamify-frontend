import { storageService } from '../async-storage.service'
import { makeId } from '../util.service'
import { userService } from '../user'

const STORAGE_KEY = 'track'

export const trackService = {
  query,
  getById,
  save,
  remove,
}

async function query(filterBy = { txt: '' }) {
  var tracks = await storageService.query(STORAGE_KEY)
  const { txt } = filterBy

  if (txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    tracks = tracks.filter((track) => regex.test(track.title) || regex.test(track.artist))
  }

  return tracks
}

function getById(trackId) {
  return storageService.get(STORAGE_KEY, trackId)
}

async function remove(trackId) {
  // throw new Error('Nope')
  await storageService.remove(STORAGE_KEY, trackId)
}

async function save(track) {
  var savedTrack
  if (track._id) {
    const trackToSave = {
      _id: track._id,
    }
    savedTrack = await storageService.put(STORAGE_KEY, trackToSave)
  } else {
    const trackToSave = {
      title: '',
      artist: '',
      duration: '' || 0,
      imgurl: '',
      youtubeId: '',
      embeddedUrl: '',
      likedBy: [],
      // Later, owner is set by the backend
      owner: userService.getLoggedinUser(),
    }
    savedTrack = await storageService.post(STORAGE_KEY, trackToSave)
  }
  return savedTrack
}
