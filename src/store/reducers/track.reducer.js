// CRUD
export const SET_TRACKS = 'SET_TRACKS'
export const SET_TRACK = 'SET_TRACK'
export const REMOVE_TRACK = 'REMOVE_TRACK'
export const ADD_TRACK = 'ADD_TRACK'
export const UPDATE_TRACK = 'UPDATE_TRACK'
export const ADD_TRACK_MSG = 'ADD_TRACK_MSG'

// Track Player
export const SET_CURRENT_TRACK = 'SET_CURRENT_TRACK'
export const SET_IS_PLAYING = 'SET_IS_PLAYING'
export const SET_IS_SHUFFLE = 'SET_IS_SHUFFLE'
export const SET_VOLUME = 'SET_VOLUME'
export const SET_PROGRESS_SEC = 'SET_PROGRESS_SEC'
export const SET_SEEK_TO_SEC = 'SET_SEEK_TO_SEC'

const initialState = {
  tracks: [],
  // track: null,

  // Player state
  currentTrack: null,
  isPlaying: false,
  isShuffle: false,
  volume: 0.8,
  progressSec: 0,
  seekToSec: null,
}

export function trackReducer(state = initialState, action) {
  var newState = state
  var tracks
  switch (action.type) {
    case SET_TRACKS:
      newState = { ...state, tracks: action.tracks }
      break
    case SET_TRACK:
      newState = { ...state, track: action.track }
      break
    case REMOVE_TRACK:
      const lastRemovedTrack = state.tracks.find(
        (track) => track._id === action.trackId
      )
      tracks = state.tracks.filter((track) => track._id !== action.trackId)
      newState = { ...state, tracks, lastRemovedTrack }
      break
    case ADD_TRACK:
      newState = { ...state, tracks: [...state.tracks, action.track] }
      break
    case UPDATE_TRACK:
      tracks = state.tracks.map((track) =>
        track._id === action.track._id ? action.track : track
      )
      newState = { ...state, tracks }
      break
    case ADD_TRACK_MSG:
      if (action.msg && state.track) {
        newState = {
          ...state,
          track: {
            ...state.track,
            msgs: [...(state.track.msgs || []), action.msg],
          },
        }
        break
      }

    // Player actions
    case SET_CURRENT_TRACK:
      newState = { ...state, currentTrack: action.track }
      break
    case SET_IS_PLAYING:
      newState = { ...state, isPlaying: action.isPlaying }
      break
    case SET_IS_SHUFFLE:
      newState = { ...state, isShuffle: action.isShuffle }
      break
    case SET_VOLUME:
      newState = { ...state, volume: action.volume }
      break
    case SET_PROGRESS_SEC:
      newState = { ...state, progressSec: action.progressSec }
      break
      case SET_SEEK_TO_SEC:
      newState = { ...state, seekToSec: action.seekToSec }
      break
    default:
  }
  return newState
}

// unitTestReducer()

function unitTestReducer() {
  var state = initialState
  const track1 = {
    _id: 'b101',
    title: 'Track ' + parseInt('' + Math.random() * 10),
    owner: null,
    msgs: [],
  }
  const track2 = {
    _id: 'b102',
    title: 'Track ' + parseInt('' + Math.random() * 10),
    owner: null,
    msgs: [],
  }

  state = trackReducer(state, { type: SET_TRACKS, tracks: [track1] })
  console.log('After SET_TRACKS:', state)

  state = trackReducer(state, { type: ADD_TRACK, track: track2 })
  console.log('After ADD_TRACK:', state)

  state = trackReducer(state, {
    type: UPDATE_TRACK,
    track: { ...track2, title: 'Good' },
  })
  console.log('After UPDATE_TRACK:', state)

  state = trackReducer(state, {
    type: REMOVE_TRACK,
    trackId: track2._id,
  })
  console.log('After REMOVE_TRACK:', state)

  state = trackReducer(state, { type: SET_TRACK, track: track1 })
  console.log('After SET_TRACK:', state)

  const msg = {
    id: 'm' + parseInt('' + Math.random() * 100),
    txt: 'Some msg',
    by: { _id: 'u123', fullname: 'test' },
  }
  state = trackReducer(state, {
    type: ADD_TRACK_MSG,
    trackId: track1._id,
    msg,
  })
  console.log('After ADD_TRACK_MSG:', state)
}
