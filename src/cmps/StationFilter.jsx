import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { stationService } from '../services/station/index'
import {
  addTrack,
  removeTrack,
  updateTrack,
} from '../store/actions/track.actions'

import { SvgIcon } from './SvgIcon'
import { updateStation } from '../store/actions/station.actions'

export function StationFilter() {
  const params = useParams()
  // const [trackToPlay, setTrackToPlay] = useState({ isPlaying: false })
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
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

  function getPlayingTrack() {
    if (!playlist || !playlist.length) return false
    const playingTrack = playlist.find((track) => track.isPlaying)
    return playingTrack ? playingTrack : false
  }

  async function onPlay(track) {
    const playingTrack = getPlayingTrack()

    if (playingTrack && playingTrack._id) {
      // console.log('removing track', trackToPlay)
      await removeTrack(playingTrack._id)
    }

    const youtubeId = await getYoutubeId(track.name)
    track.youtubeId = youtubeId
    track.isPlaying = true

    const savedTrack = await addTrack(track)
    await updateTrack(savedTrack)
    // console.log('Track to save', trackToPlay)
  }

  async function onPause(track) {
    // console.log('pausing track', track)
    track.isPlaying = false
    const savedTrack = await updateTrack(track)

    await updateTrack(savedTrack)
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

  function formatDuration(durationMs) {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  async function onAddToLikedSongs(track) {
    // console.log('Adding to Liked Songs:', track)
    const likedSongs = stations.find(
      (station) => station.title === 'Liked Songs'
    )
    if (!likedSongs) return

    const isTrackInLikedSongs = likedSongs.tracks.some(
      (t) => t.spotifyId === track.spotifyId
    )
    if (isTrackInLikedSongs) {
      console.log('Track already in Liked Songs:', track)
      return
    }
    delete track.isPlaying
    console.log('likedSongs:', likedSongs)
    likedSongs.tracks.push(track)
    await updateStation(likedSongs)
    // console.log('Updated likedSongs:', likedSongs)
  }

  if (!searchedTracks?.length) return <div>Loading...</div>

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
            key={idx}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="track-num">
              {getPlayingTrack().isPlaying &&
              getPlayingTrack().spotifyId === track.spotifyId ? (
                <div className="track-num">
                  {getPlayingTrack().isPlaying &&
                  getPlayingTrack().spotifyId === track.spotifyId ? (
                    hoveredTrackIdx === idx ? (
                      <SvgIcon
                        iconName="pause"
                        className="pause"
                        onClick={() => onPause(getPlayingTrack())}
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
                <span className="track-name">{track.name}</span>
                <div className="track-artists">
                  {track.artists.map((artist, i) => (
                    <span key={artist.id}>
                      {artist.name}
                      {i < track.artists.length - 1 ? ', ' : ''}
                    </span>
                  ))}
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
                {formatDuration(track.duration)}
              </span>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}
