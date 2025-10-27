import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { SvgIcon } from '../cmps/SvgIcon'
import { FastAverageColor } from 'fast-average-color'
import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
  setIsShuffle,
} from '../store/actions/track.actions'
import { TrackList } from '../cmps/TrackList'
import { Loader } from '../cmps/Loader'

export function ArtistDetails() {
  const params = useParams()
  const [artist, setArtist] = useState(null)

  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const isShuffle = useSelector(
    (storeState) => storeState.trackModule.isShuffle
  )

  useEffect(() => {
    if (params.Id && params.Id !== '') {
      loadArtist(params.Id)
    }

  }, [params.Id])

 useEffect(() => {
    if (artist && artist.imgUrls?.[0]) {
      const fac = new FastAverageColor()
      const imgElement = document.querySelector('.avg-img')

      const backgroundTrackList = document.querySelector('.background-track-list')
      if (imgElement) {
        imgElement.crossOrigin = 'Anonymous'
        fac
          .getColorAsync(imgElement, { algorithm: 'dominant' })
          .then((color) => {
          
 backgroundTrackList.style.backgroundImage = `
            linear-gradient(to top,rgba(0, 0, 0, 0.6) 0, ${color.rgba} 300%),
            var(--background-noise)
          `
          })
          .catch((e) => {
            console.log(e)
          })
      }
    }
    
  }, [artist])





  async function loadArtist(artistId) {
    const artist = await spotifyService.getSpotifyItems('artistData', artistId)
    setArtist(artist)
  }

  async function onPlay(track) {
    // Clear existing playlist
    if (playlist && playlist.length) {
      await setTracks([])
    }

    const playlistQueue = await Promise.all(
      artist.topTracks.map(async (track, index) => {
        // create a new array with nextId and prevId
        return {
          ...track,
          nextId:
            index < artist.topTracks.length - 1
              ? artist.topTracks[index + 1].spotifyId
              : artist.topTracks[0].spotifyId,
          prevId:
            index > 0
              ? artist.topTracks[index - 1].spotifyId
              : artist.topTracks[artist.topTracks.length - 1].spotifyId,
          youtubeId: await getYoutubeId(track.name),
        }
      })
    )

    // Set the entire playlist at once
    await setTracks(playlistQueue)

    // Set the current track and start playing
    const trackToPlay = playlistQueue.find(
      (t) => t.spotifyId === track.spotifyId
    )
    if (trackToPlay) {
      await setCurrentTrack(trackToPlay)
      await setIsPlaying(true)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }

  async function getYoutubeId(str) {
    // console.log('Getting YouTube ID for:', str)
    try {
      const res = await youtubeService.getYoutubeItems(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

 function isStationCurrentlyPlaying() {
    if (!currentTrack || !artist || !artist.topTracks) return false
    return artist.topTracks.some(track => track.spotifyId === currentTrack.spotifyId)
  }

  async function onShuffle() {
    // Toggle shuffle state
    const newShuffleState = !isShuffle
    setIsShuffle(newShuffleState)

    // Need artist top tracks to shuffle
    if (!artist || !artist.topTracks || artist.topTracks.length === 0) return

    // Clear existing playlist
    if (playlist && playlist.length) {
      await setTracks([])
    }

    let tracksToPlay = []

    if (newShuffleState) {
      // If turning shuffle ON, create shuffled playlist
      tracksToPlay = [...artist.topTracks].sort(() => Math.random() - 0.5)
    } else {
      // If turning shuffle OFF, restore original chronological order
      tracksToPlay = [...artist.topTracks]
    }

    // Create playlist with proper nextId and prevId based on current order
    const playlistQueue = await Promise.all(
      tracksToPlay.map(async (track, index) => {
        return {
          ...track,
          nextId:
            index < tracksToPlay.length - 1
              ? tracksToPlay[index + 1].spotifyId
              : tracksToPlay[0].spotifyId,
          prevId:
            index > 0
              ? tracksToPlay[index - 1].spotifyId
              : tracksToPlay[tracksToPlay.length - 1].spotifyId,
          youtubeId: await getYoutubeId(track.name),
        }
      })
    )

    // Set the new playlist (shuffled or chronological)
    await setTracks(playlistQueue)

    // If turning shuffle ON, start playing the first track
    // If turning shuffle OFF, keep current track but update its connections
    if (newShuffleState) {
      const firstTrack = playlistQueue[0]
      if (firstTrack) {
        await setCurrentTrack(firstTrack)
        await setIsPlaying(true)
      }
    } else {
      // When turning shuffle OFF, update current track with new next/prev connections
      if (currentTrack) {
        const updatedCurrentTrack = playlistQueue.find(
          (track) => track.spotifyId === currentTrack.spotifyId
        )
        if (updatedCurrentTrack) {
          await setCurrentTrack(updatedCurrentTrack)
        }
      }
    }
  }

if (!artist) return
     (
      <div className="artist-details">
        <div className="loader-center">
          <Loader />
        </div>
      </div>
    )
  return (
    <section className="artist-details">
      <header className="artist-details-header">
        <div className="img-header-container">
          <img src={artist?.imgUrls?.[0]} alt={artist?.name} className='avg-img' />
 <div className="background-track-list"></div>
          <div className="artist-details-info">
            <span className="verified-artist">
              <SvgIcon iconName="verified" className="background" />
              <span className="verified"> Verified Artist</span>
            </span>
            <h1>{artist?.name}</h1>

            <span className="followers">
              {artist?.followers?.toLocaleString()} monthly listeners
            </span>
          </div>
        </div>
        
      </header>
      <div className="action-btns">
        {isStationCurrentlyPlaying() && isPlaying ? (
          <button onClick={onPause} className="play-btn">
                <SvgIcon iconName="pause" className="pause" />
              </button>
            ) : (
        <button
          onClick={() => {
            onPlay(artist?.topTracks[0])
          }}
          className="play-btn"
        >
          <SvgIcon iconName="play" className="play" />
        </button>
         )} 
        <button 
          className={`shuffle-btn ${isShuffle ? 'active' : ''}`} 
          onClick={() => onShuffle()}
        >
          <SvgIcon iconName="shuffle" />
        </button>
      </div>

      <div className="top-tracks">
        <h2>Popular</h2>
        <TrackList
          tracks={artist?.topTracks}
          onPlay={onPlay}
          onPause={onPause}
        />
      </div>
    </section>
  )
}
