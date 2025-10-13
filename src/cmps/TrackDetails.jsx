import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { spotifyService } from '../services/spotify.service'
import { SvgIcon } from './SvgIcon'
import { LongText } from './LongText'
import { TrackList } from './TrackList'
import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
} from '../store/actions/track.actions'
import { youtubeService } from '../services/youtube.service'

export function TrackDetails() {
  const params = useParams()
  const [track, setTrack] = useState(null)

  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

  useEffect(() => {
    if (params.Id && params.Id !== '') {
      loadTrack(params.Id)
    }
  }, [params.Id])

  async function loadTrack(trackId) {
    const track = await spotifyService.getFullTrackData(trackId)
    setTrack(track)
    console.log(track.artists[0].imgUrls[0]);
    
  }

  async function onPlay(track) {
    try {
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      // Get YouTube ID for the track
      const youtubeId = await getYoutubeId(track.name)
      const trackWithYoutube = {
        ...track,
        youtubeId,
      }

      // Set single track as playlist and play it
      await setTracks([trackWithYoutube])
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing track:', err)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getVideos(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  return (
    <section className="track-details">
      <header className="track-details-header">
        <div className="img-container">
          <img src={track?.album?.imgUrls[0]} alt={track?.name} />
        </div>
        <div className="track-details-info">
          <p>Song</p>
          <h1>{track?.name}</h1>
          <div className="more-info">
            <span className="artist-img">
              <img src={track?.artists[0]?.imgUrls[0]} alt={track?.artists[0]?.name} />
            </span>
            <span className="artist-name">{track?.artists[0]?.name}</span>
            <span className="album-name">{track?.album?.name}</span>
            <span className="release-date">{track?.releaseDate}</span>
            <span className="duration">{track?.duration}</span>
            <span className="followers">
              {track?.artists[0]?.followers?.toLocaleString()}{' '}
            </span>
          </div>
        </div>
      </header>
      <div className="action-btns">
        {currentTrack?.spotifyId === track?.spotifyId && isPlaying ? (
          <button onClick={onPause} className="play-btn">
            <SvgIcon iconName="pause" className="pause" />
          </button>
        ) : (
          <button
            onClick={() => {
              // If there's a current track from this station that's paused, just resume
              // if (currentTrack && isStationCurrentlyPlaying() && !isPlaying) {
              //   onResume()
              // } else {
              onPlay(track)
              // }
            }}
            className="play-btn"
            //   disabled={!station.tracks || station.tracks.length === 0}
          >
            <SvgIcon iconName="play" className="play" />
          </button>
        )}
        {/* <SvgIcon iconName="shuffle" /> */}
      </div>

      <div className="lyrics-artist-container">
        <div className="lyrics">
          <h2>Lyrics</h2>
          <LongText txt={track?.lyrics} />
        </div>
        <div className="artist-data">
          <span className="artist-img">
            <img
              width={'60px'}
              src={track?.artists[0]?.imgUrls[0]}
              alt={track?.artists[0]?.name}
            />
          </span>
          <div className="artist-mini-data">
            <p>Artist</p>
            <span className="artist-name">{track?.artists[0]?.name}</span>
          </div>
        </div>
      </div>

      {/* <div className="album-tracks">
        <TrackList
                tracks={track?.album?.tracks}
                onPlay={onPlay}
                onPause={onPause}
              />
      </div> */}
    </section>
  )
}
