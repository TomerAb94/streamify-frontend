import { loadFromStorage, saveToStorage } from './util.service.js'
import { httpService } from './http.service.js'
import axios from 'axios'

export const youtubeService = {
	getVideos,
	getYoutubeItems
}


async function getYoutubeItems(query='') {

  return await httpService.get(`youtube`, {query})
 
}


function getVideos(keyword) {
	if (gVideoMap[keyword]) {
		return Promise.resolve(gVideoMap[keyword])
	}

	return axios.get(`${ytURL}&q=${keyword}`).then(({ data }) => {
		// console.log(data)
		gVideoMap[keyword] = data.items.map(_getVideoInfo)
		// console.log(gVideoMap[keyword])
		saveToStorage(VIDEOS_STORAGE_KEY, gVideoMap)
		return gVideoMap[keyword]
	})
}

function _getVideoInfo(video) {

	const { id, snippet } = video
	const { title, thumbnails } = snippet

	const videoId = id.videoId
	const thumbnail = thumbnails.default.url

	return { id: videoId, title, thumbnail }
}
