const { DEV, VITE_LOCAL } = import.meta.env

import { getRandomIntInclusive, makeId } from '../util.service'
import { userService } from '../user'

import { stationService as local } from './station.service.local'
import { stationService as remote } from './station.service.remote'

function getEmptyStation() {
  const user = userService.getLoggedinUser()

  return {
    _id: '',
    title: `My Playlist #`, //later add number of playilist
    tags: [],
    stationImgUrl: '',
    // 'https://res.cloudinary.com/dys1sj4cd/image/upload/v1699955746/note1_zaakp6.png'
    stationType: 'playlist',
    createdBy: {
      _id: user._id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
    },
    likedByUsers: [],
    isPinned: false,
    tracks: [],
    reviews: [],
    description: '',
    createdAt: Date.now(),
  }
}

function getDefaultFilter() {
  return {
    txt: '',
    loggedinUser: userService.getLoggedinUser() || '',
    sortField: '',
    sortDir: '',
  }
}

function getDefaultStation(user) {
  return {
    _id: '',
    title: 'Liked Songs',
    tags: ['Liked Songs'],
    stationImgUrl: 'https://misc.scdn.co/liked-songs/liked-songs-300.jpg',
    stationType: 'playlist',
    createdBy: {
      _id: user._id,
      fullname: user.fullname,
      imgUrl: user.imgUrl,
    },
    createdAt: Date.now(),
    likedByUsers: [],
    isPinned: true,
    tracks: [],
    reviews: [],
    description: '',
  }
}

const service = VITE_LOCAL === 'true' ? local : remote
export const stationService = {
  getEmptyStation,
  getDefaultFilter,
  getDefaultStation,
  ...service,
}

// Easy access to this service from the dev tools console
// when using script - dev / dev:local

if (DEV) window.stationService = stationService
