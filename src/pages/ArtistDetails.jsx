import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { SvgIcon } from '../cmps/SvgIcon'

import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
} from '../store/actions/track.actions'
import { TrackList } from '../cmps/TrackList'

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

  useEffect(() => {
    if (params.Id && params.Id !== '') {
      loadArtist(params.Id)
    }
  }, [params.Id])

  async function loadArtist(artistId) {
    const artist = await spotifyService.getArtistData(artistId)
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
      const res = await youtubeService.getVideos(str)
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

if (!artist) return <div>Loading...</div>
  return (
    <section className="artist-details">
      <header className="artist-details-header">
        <div className="img-header-container">
          <img src={artist?.imgUrls?.[0]} alt={artist?.name} />

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
        {/* <SvgIcon iconName="shuffle" /> */}
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
