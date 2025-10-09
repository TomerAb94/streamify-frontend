import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'

import {
  addTrack,
  removeTrack,
  updateTrack,
} from '../store/actions/track.actions'
import { SvgIcon } from './SvgIcon'

export function StationFilter() {
  const params = useParams()
  const [searchedTracks, setSearchedTracks] = useState([])
  const [trackToPlay, setTrackToPlay] = useState({ isPlaying: false })

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

  async function onPlay(track) {
    if (trackToPlay && trackToPlay._id) {
      // console.log('removing track', trackToPlay)
      await removeTrack(trackToPlay._id)
    }

    const youtubeId = await getYoutubeId(track.name)
    track.youtubeId = youtubeId
    track.isPlaying = true

    const savedTrack = await addTrack(track)
    setTrackToPlay(savedTrack)
    // console.log('Track to save', trackToPlay)
  }

  async function onPause(track) {
    // console.log('pausing track', track)
    track.isPlaying = false
    const savedTrack = await updateTrack(track)

    setTrackToPlay(savedTrack)
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

  function handleMouseEnter(idx, trackToPlay, spotifyId) {
    setHoveredTrackIdx(idx)
    // console.log(trackToPlay)
    // console.log(spotifyId)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
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
            key={track.id}
            onMouseEnter={() => handleMouseEnter(idx, trackToPlay, track.id)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="track-num">
              {trackToPlay.isPlaying &&
              trackToPlay.spotifyId === track.spotifyId ? (
              <div className="track-num">
  {trackToPlay.isPlaying && trackToPlay.spotifyId === track.spotifyId
    ? (hoveredTrackIdx === idx
        ? <SvgIcon iconName="pause" className="pause" onClick={() => onPause(trackToPlay)} />
        : <SvgIcon iconName="equalizer" className="equalizer" />
      )
    : (hoveredTrackIdx === idx
        ? <SvgIcon iconName="play" className="play" onClick={() => onPlay(track)} />
        : idx + 1
      )
  }
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
            <div className="track-duration">
              {formatDuration(track.duration)}
              <SvgIcon iconName="addLikedSong" className="add-liked-song" />
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}
