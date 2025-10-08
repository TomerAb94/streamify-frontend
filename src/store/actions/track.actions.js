import { trackService } from '../../services/track'
import { store } from '../store'
import { ADD_TRACK, REMOVE_TRACK, SET_TRACKS, SET_TRACK, UPDATE_TRACK, ADD_TRACK_MSG, SET_CURRENT_TRACK, SET_IS_PLAYING, SET_VOLUME, SET_PROGRESS_PCT, SET_DURATION_SEC, SET_SEEK_TO_SEC } from '../reducers/track.reducer'

export async function loadTracks(filterBy) {
    
    try {
        const tracks = await trackService.query(filterBy)
        store.dispatch(getCmdSetTracks(tracks))
    } catch (err) {
        console.log('Cannot load tracks', err)
        throw err
    }
}

export async function loadTrack(trackId) {
    try {
        const track = await trackService.getById(trackId)
        store.dispatch(getCmdSetTrack(track))
    } catch (err) {
        console.log('Cannot load track', err)
        throw err
    }
}


export async function removeTrack(trackId) {
    try {
        await trackService.remove(trackId)
        store.dispatch(getCmdRemoveTrack(trackId))
    } catch (err) {
        console.log('Cannot remove track', err)
        throw err
    }
}

export async function addTrack(track) {
    try {
        const savedTrack = await trackService.save(track)
        store.dispatch(getCmdAddTrack(savedTrack))
        return savedTrack
    } catch (err) {
        console.log('Cannot add track', err)
        throw err
    }
}

export async function updateTrack(track) {
    console.log('track to update:', track);
    
    try {
        const savedTrack = await trackService.save(track)
        store.dispatch(getCmdUpdateTrack(savedTrack))
        return savedTrack
    } catch (err) {
        console.log('Cannot save track', err)
        throw err
    }
}

export async function addTrackMsg(trackId, txt) {
    try {
        const msg = await trackService.addTrackMsg(trackId, txt)
        store.dispatch(getCmdAddTrackMsg(msg))
        return msg
    } catch (err) {
        console.log('Cannot add track msg', err)
        throw err
    }
}

// Command Creators:
function getCmdSetTracks(tracks) {
    return {
        type: SET_TRACKS,
        tracks
    }
}
function getCmdSetTrack(track) {
    return {
        type: SET_TRACK,
        track
    }
}
function getCmdRemoveTrack(trackId) {
    return {
        type: REMOVE_TRACK,
        trackId
    }
}
function getCmdAddTrack(track) {
    return {
        type: ADD_TRACK,
        track
    }
}
function getCmdUpdateTrack(track) {
    return {
        type: UPDATE_TRACK,
        track
    }
}
function getCmdAddTrackMsg(msg) {
    return {
        type: ADD_TRACK_MSG,
        msg
    }
}

// unitTestActions()
async function unitTestActions() {
    await loadTracks()
    await addTrack(trackService.getEmptyTrack())
    await updateTrack({
        _id: 'm1oC7',
        title: 'Track-Good',
    })
    await removeTrack('m1oC7')
    // TODO unit test addTrackMsg
}
