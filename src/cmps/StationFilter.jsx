import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import {
  setTracks,
  setCurrentTrack,
  setIsPlaying,
} from '../store/actions/track.actions'

import { SvgIcon } from './SvgIcon'
import { updateStation } from '../store/actions/station.actions'
import { NavLink } from 'react-router-dom'

export function StationFilter() {
  const params = useParams()
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const [searchedTracks, setSearchedTracks] = useState([])

  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)

  useEffect(() => {
    if (params.searchStr || params.searchStr !== '') {
      loadSearchedTracks()
    }
  }, [params.searchStr])

  async function loadSearchedTracks() {
    try {
      const spotifyTracks = await spotifyService.getSearchedTracks(
        params.searchStr
      )
      setSearchedTracks(spotifyTracks)
      // console.log('spotifyTracks:', spotifyTracks)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  function isTrackCurrentlyPlaying(track) {
    return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
  }

  async function onPlay(track) {
    try {
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      // Get YouTube ID for the track
      const youtubeId = await getYoutubeId(track.name + ' ' + track.artists[0]?.name)
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

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  async function onAddToLikedSongs(track) {
    try {
      const likedSongs = stations.find(
        (station) => station.title === 'Liked Songs'
      )
      if (!likedSongs) return

      const isTrackInLikedSongs = likedSongs.tracks.some(
        (t) => t.spotifyId === track.spotifyId
      )
      if (isTrackInLikedSongs) {
        console.log('Track already in Liked Songs')
        return
      }

      // Create clean track without player state properties
      const cleanTrack = { ...track }
      delete cleanTrack.isPlaying
      delete cleanTrack.youtubeId

      const updatedLikedSongs = {
        ...likedSongs,
        tracks: [...likedSongs.tracks, cleanTrack]
      }
      
      await updateStation(updatedLikedSongs)
    } catch (err) {
      console.error('Error adding track to Liked Songs:', err)
    }
  }

  if (!searchedTracks?.length) return <div>Loading...</div>
console.log(searchedTracks);

  return (
    <section className="station-filter">
      <h2>Songs</h2>
      <section className="track-list">
        <div className="track-header">
          <div className="first-col-header">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="duration-header-icon">
            <SvgIcon iconName="duration" className="duration" />
          </div>
        </div>

        {searchedTracks.map((track, idx) => (
          <div
            className="track-row"
            key={track.spotifyId ? `${track.spotifyId}-${idx}` : `track-${idx}`}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`track-num ${currentTrack && currentTrack.spotifyId === track.spotifyId ? 'playing' : ''}`}>
              {isTrackCurrentlyPlaying(track) ? (
                hoveredTrackIdx === idx ? (
                  <SvgIcon
                    iconName="pause"
                    className="pause"
                    onClick={() => onPause()}
                  />
                ) : (
                  <SvgIcon iconName="equalizer" className="equalizer" />
                )
              ) : hoveredTrackIdx === idx ? (
                <SvgIcon
                  iconName="play"
                  className="play"
                  onClick={() => onPlay(track)}
                />
              ) : (
                idx + 1
              )}
            </div>

            <div className="track-title">
              {track.album?.imgUrl && (
                <img
                  src={track.album.imgUrl}
                  alt={`${track.name} cover`}
                  className="track-img"
                />
              )}
              <div className="track-text">
                <NavLink to={`/track/${track.spotifyId}`}>
                  <span className={`track-name nav-link ${currentTrack && currentTrack.spotifyId === track.spotifyId ? 'playing' : ''}`}>{track.name}</span>
                </NavLink>
                <div className="track-artists">
                 <NavLink key={track.artists[0].id[0]} to={`/artist/${track.artists[0].id[0]}`}>
                    <span className="nav-link">
                      {track.artists[0].name}
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="track-album">{track.album?.name}</div>
            <div className="track-duration-container">
              <SvgIcon
                iconName="addLikedSong"
                className="addLikedSong"
                title="Add to Liked Songs"
                onClick={() => onAddToLikedSongs(track)}
              />
              <span className="track-duration">
                {track.duration}
              </span>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}
