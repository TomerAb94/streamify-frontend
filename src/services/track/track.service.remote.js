import { httpService } from '../http.service'

export const trackService = {
    query,
    getById,
    save,
    remove,
}

async function query(filterBy = { txt: ''}) {
    return httpService.get(`track`, filterBy)
}

function getById(trackId) {
    return httpService.get(`track/${trackId}`)
}

async function remove(trackId) {
    return httpService.delete(`track/${trackId}`)
}
async function save(track) {
    var savedTrack
    if (track._id) {
        savedTrack = await httpService.put(`track/${track._id}`, track)
    } else {
        savedTrack = await httpService.post('track', track)
    }
    return savedTrack
}
