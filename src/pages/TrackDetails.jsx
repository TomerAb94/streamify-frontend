import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { NavLink } from 'react-router-dom'

import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { SvgIcon } from '../cmps/SvgIcon'
import { LongText } from '../cmps/LongText'
import { TrackList } from '../cmps/TrackList'
import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
} from '../store/actions/track.actions'
import { Loader } from '../cmps/Loader'

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
    console.log(track)
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
  if (!track) return (
    <section className="track-details">
      <div className="loader-center">
        <Loader />
      </div>
    </section>
  )

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
              <img
                src={track?.artists[0]?.imgUrls[0]}
                alt={track?.artists[0]?.name}
              />
            </span>
            <NavLink to={`/artist/${track?.artists?.[0]?.id}`}>
              <span className="artist-name nav-link">{track?.artists[0]?.name}</span>
            </NavLink>
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
              onPlay(track)
            }}
            className="play-btn"
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
        <NavLink
          className={'artist-link'}
          to={`/artist/${track?.artists?.[0]?.id?.[0]}`}
        >
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
              <span className="artist-name nav-link">
                {track?.artists[0]?.name}
              </span>
            </div>
          </div>
        </NavLink>
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
