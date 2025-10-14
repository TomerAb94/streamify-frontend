import { youtubeService } from "./youtube.service"


const CLIENT_ID = 'bc0de1d56cf04139b055dab040514fc2'
const CLIENT_SECRET = 'a95e1562557f434489e50790a67ab105'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE_URL = 'https://api.spotify.com/v1'

let accessToken = null
let tokenExpiryTime = null

export const spotifyService = {
  getAccessToken,
  searchTracks,
  searchArtists,
  searchAlbums,
  getTrack,
  getArtist,
  getAlbum,
  initializePlayer,
  playTrack,
  pauseTrack,
  getCurrentPlayback,
  getSearchedTracks,
  getGenres,
  getGenrePlaylists,
  getTracksPlaylist,
  getFullTrackData,
  getArtistData,
}




async function getAccessToken() {
  if (accessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return accessToken
  }

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()

    if (response.ok) {
      accessToken = data.access_token
      tokenExpiryTime = Date.now() + data.expires_in * 1000
      return accessToken
    } else {
      throw new Error(`Token request failed: ${data.error}`)
    }
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

async function makeSpotifyRequest(endpoint) {
  const token = await getAccessToken()
  // console.log(token);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify API request failed: ${response.status}`)
  }

  return response.json()
}

async function getSearchedTracks(query, limit = 5, offset = 0) {
  const tracksFromSpotify = await searchTracks(query, limit, offset)
  let tracks = tracksFromSpotify.tracks.items

  tracks = tracks.map((track) => {
    return {
      spotifyId: track.id,
      name: track.name,
      album: { name: track.album.name, imgUrl: track.album.images[0].url },
      artists: [
        {
          name: track.artists.map((artist) => artist.name).join(', '),
          id: track.artists.map((artist) => artist.id),
        },
      ],
      duration: formatDuration(track.duration_ms),
      youtubeId: null,
    }
  })

  return tracks
}

function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

async function searchTracks(query, limit = 5, offset = 0) {
  const endpoint = `/search?q=${encodeURIComponent(
    query
  )}&type=track&artist&album&limit=${limit}&offset=${offset}`
  return makeSpotifyRequest(endpoint)
}

async function searchArtists(query, limit = 20, offset = 0) {
  const endpoint = `/search?q=${encodeURIComponent(
    query
  )}&type=artist&limit=${limit}&offset=${offset}`
  return makeSpotifyRequest(endpoint)
}

async function searchAlbums(query, limit = 20, offset = 0) {
  const endpoint = `/search?q=${encodeURIComponent(
    query
  )}&type=album&limit=${limit}&offset=${offset}`
  return makeSpotifyRequest(endpoint)
}

async function getTrack(trackId) {
  const endpoint = `/tracks/${trackId}`
  return makeSpotifyRequest(endpoint)
}

async function getLyrics(artist, track) {
  try {
    // Using lyrics.ovh (free, no API key)
    const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`)
    
    if (response.ok) {
      const data = await response.json()
      return data.lyrics
    }
    return null
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return null
  }
}

async function getFullTrackData(trackId) {
  const trackFromSpotify = await getTrack(trackId)
  const artistFromSpotify = await getArtist(trackFromSpotify.artists[0].id)
  const albumFromSpotify = await getAlbum(trackFromSpotify.album.id)
  const lyrics = await getLyrics(artistFromSpotify.name, trackFromSpotify.name)

  const track = trackFromSpotify
  const artist = artistFromSpotify
  const album = albumFromSpotify

  let fullData = {
    spotifyId: track.id,
    name: track.name,
    releaseDate: track.album.release_date,
    duration: formatDuration(track.duration_ms),
    album: {
      id: album.id,
      name: album.name,
      imgUrls: album.images.map((img) => img.url),
      tracks: album.tracks.items.map((t) => ({ id: t.id, name: t.name })),
    },
    artists: [
      {
        id: artist.id,
        name: artist.name,
        imgUrls: artist.images.map((img) => img.url),
        followers: artist.followers.total,
        genres: artist.genres,
      },
    ],
    lyrics: lyrics || 'Lyrics not found',
    youtubeId: null,
  }

  return fullData
}

async function getArtist(artistId) {
  const endpoint = `/artists/${artistId}`
  return makeSpotifyRequest(endpoint)
}

async function getArtistData(artistId) {
  let artist = await getArtist(artistId)
  let tracks = await getSearchedTracks(artist.name, 5)

  artist = {
    id: artist.id,
    name: artist.name,
    imgUrls: artist.images.map((img) => img.url),
    followers: artist.followers.total,
    genres: artist.genres,
    topTracks: tracks,
  }
  
  return artist
}

async function getAlbum(albumId) {
  const endpoint = `/albums/${albumId}`
  return makeSpotifyRequest(endpoint)
}


async function getGenres(limit = 50, offset = 0) {
  try {
    const endpoint = `/browse/categories?limit=${limit}&offset=${offset}&locale=en_IL`
    const response = await makeSpotifyRequest(endpoint)
    return response.categories.items.map(category => ({
      id: category.id,
      name: category.name,
      icons: category.icons
    }))
  } catch (error) {
    console.error('Error fetching genres/categories:', error)
    throw error
  }
}



async function getGenrePlaylists(genre) {
  try{
  const endpoint =  `/search?q=${encodeURIComponent(genre)}&type=playlist&market=US&limit=50`
  const response = await makeSpotifyRequest(endpoint)
  return response.playlists.items.filter(playlist => playlist!==null)
  }
 catch (error) {
    console.error('Error fetching genres/categories:', error)
    throw error
  }
}

async function getTracksPlaylist(playlistId) {
  try {
    const endpoint = `/playlists/${playlistId}`
    const response = await makeSpotifyRequest(endpoint)
    
    // Extract playlist metadata
    const playlistInfo = {
      id: response.id,
      name: response.name,
      description: response.description,
      imgUrl: response.images[0]?.url,
      owner: response.owner.display_name,
      ownerProfileImg:await getSpotifyUserProfileImg(response.owner.id),
      followers: response.followers.total,
      tracksTotal: response.tracks.total,
      isPublic:response.public ? 'Public Playlist':'Private Playlist'
    }

    // Map tracks to clean format and add navigation IDs
    const tracks = await Promise.all(
      response.tracks.items
        .filter(item => item && item.track)
        .map(async (item, index, arr) => {
          const track = item.track
          return {
            spotifyId: track.id,
            name: track.name,
            album: { 
              name: track.album.name, 
              imgUrl: track.album.images?.[0]?.url 
            },
            artists: [{
              name: track.artists.map((artist) => artist.name).join(', '),
              id: track.artists.map((artist) => artist.id),
            }],
            duration: formatDuration(track.duration_ms),
            addedAt: item.added_at,
            youtubeId: null,
            prevId: index === 0 ? arr[arr.length - 1].track.id : arr[index - 1].track.id,
            nextId: index === arr.length - 1 ? arr[0].track.id : arr[index + 1].track.id
          }
        })
    )

    return {
      playlist: playlistInfo,
      tracks: tracks
    }
  } catch (error) {
    console.error('Error fetching playlist tracks:', error)
    throw error
  }
}





// const result = await spotifyService.getTracksPlaylist('3z0MRRZHSNPI4tPEjcCZRV');
// console.log(result.playlist); // מידע על הפלייליסט
// console.log(result.tracks);   // מערך של השירים


// Note: These functions require user authentication and Spotify Premium
let player = null
let deviceId = null

async function initializePlayer(userAccessToken) {
  return new Promise((resolve, reject) => {
    const initPlayer = () => {
      if (!window.Spotify) {
        reject(new Error('Spotify Web Playback SDK not loaded'))
        return
      }

      player = new window.Spotify.Player({
        name: 'Your App Player',
        getOAuthToken: (cb) => {
          cb(userAccessToken)
        },
        volume: 0.5,
      })

      player.addListener('ready', ({ device_id }) => {
        deviceId = device_id
        console.log('Ready with Device ID', device_id)
        resolve(device_id)
      })

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id)
      })

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message)
        reject(new Error('Authentication failed'))
      })

      player.connect()
    }

    if (window.Spotify) {
      initPlayer()
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer
    }
  })
}

async function playTrack(trackUri, userAccessToken) {
  if (!deviceId) {
    throw new Error('Player not initialized')
  }

  const response = await fetch(
    `${API_BASE_URL}/me/player/play?device_id=${deviceId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri], // e.g., "spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to play track: ${response.status}`)
  }
}

async function pauseTrack(userAccessToken) {
  const response = await fetch(`${API_BASE_URL}/me/player/pause`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to pause: ${response.status}`)
  }
}

async function getCurrentPlayback(userAccessToken) {
  const response = await fetch(`${API_BASE_URL}/me/player`, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  })

  if (response.ok) {
    return response.json()
  }
  return null
}




  async function getSpotifyUserProfileImg(userId) {
  try{
  const endpoint =  `/users/${userId}`
  const response = await makeSpotifyRequest(endpoint)

  return response.images[0].url
  }
 catch (error) {
    console.error('Error fetching genres/categories:', error)
    throw error
  }
}


