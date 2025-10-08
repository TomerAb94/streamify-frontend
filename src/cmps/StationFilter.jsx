import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { addTrack, removeTrack } from '../store/actions/track.actions'
import { trackService } from '../services/track'
import { SvgIcon } from './SvgIcon'

export function StationFilter() {
  const params = useParams()
  const [searchedTracks, setSearchedTracks] = useState([])
  const [trackToPlay, setTrackToPlay] = useState(null)

  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)

  useEffect(() => {
    if (params.searchStr || params.searchStr !== '') {
      loadSearchedTracks()
    }
  }, [params.searchStr])

  async function loadSearchedTracks() {
    try {
      const res = await spotifyService.searchTracks(params.searchStr)
      setSearchedTracks(res.tracks.items)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  async function onPlay(track) {
    if (trackToPlay) await removeTrack(trackToPlay._id)

    const trackToSave = {
      name: track.name,
      imgUrl: track.album?.images?.[0]?.url || null,
      artists: track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      duration_ms: track.duration_ms,
      isPlaying: true,
    }

    const youtubeId = await getYoutubeId(track.name)
    trackToSave.youtubeId = youtubeId

    const savedTrack = await addTrack(trackToSave)
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

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
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
    <div className='first-col-header'>#</div>
    <div>Title</div>
    <div>Album</div>
    <div className='duration-header-icon'><SvgIcon iconName="duration" className="duration" /></div>
  </div>

  {searchedTracks.map((track, idx) => (
    <div
      className="track-row"
      key={track.id}
      onMouseEnter={() => handleMouseEnter(idx)}
      onMouseLeave={() => handleMouseLeave()}
    >
      <div className="track-num">
        {hoveredTrackIdx === idx ? (
          <SvgIcon iconName="play" className="play" onClick={() => onPlay(track)} />
          
        ) : (
          idx + 1
        )}
      </div>

      <div className="track-title">
        {track.album?.images?.[0]?.url && (
          <img src={track.album.images[0].url} alt={`${track.name} cover`} className="track-img" />
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
        {formatDuration(track.duration_ms)}
        <SvgIcon iconName="addLikedSong" className="add-liked-song" />
      </div>
    </div>
  ))}
</section>

    </section>
  )
}
