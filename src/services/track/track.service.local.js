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
  console.log('track to save:', track)
  
  var savedTrack
  if (track._id) {
    const trackToSave = {
      _id: track._id,
      youtubeId: track.youtubeId,
      isPlaying: track.isPlaying,
    }
    savedTrack = await storageService.put(STORAGE_KEY, trackToSave)
  } else {
    const trackToSave = {
      youtubeId: track.youtubeId,
      isPlaying: track.isPlaying,
    }
    savedTrack = await storageService.post(STORAGE_KEY, trackToSave)
  }
  return savedTrack
}
