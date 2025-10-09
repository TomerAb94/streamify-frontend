import { loadFromStorage, saveToStorage } from './util.service.js'
import axios from 'axios'

export const youtubeService = {
	getVideos,
}

const YT_API_KEY = 'AIzaSyBPIUp7Ezw7-DfRMW1xEWcOSaH7oA0mzck'

const VIDEOS_STORAGE_KEY = 'videosDB'

let gVideoMap = loadFromStorage(VIDEOS_STORAGE_KEY) || {}

const ytURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&videoEmbeddable=true&type=video&key=${YT_API_KEY}`

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
