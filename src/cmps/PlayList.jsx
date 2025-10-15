import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { FastAverageColor } from 'fast-average-color'
import { youtubeService } from '../services/youtube.service'
import { setTracks,setCurrentTrack, setIsPlaying} from '../store/actions/track.actions'

import { updateStation } from '../store/actions/station.actions'
import { useSelector } from 'react-redux'

export function PlayList() {
  const params = useParams()
  const [playlist, setPlaylist] = useState(null)
  
  const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)
 const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
   const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)

  useEffect(() => {
    loadPlaylist()
   
  }, [params.playlistId])


  
useEffect(() => {
  if (playlist?.playlist?.imgUrl) {
    const fac = new FastAverageColor()
    const imgElement = document.querySelector('.playlist-cover')
    const background = document.querySelector('.playlist-header')

    if (imgElement) {
      imgElement.crossOrigin = 'Anonymous'
      fac
        .getColorAsync(imgElement)
        .then((color) => {
          background.style.backgroundColor = color.rgba
          background.style.background = `linear-gradient(to bottom,${color.rgba}, rgba(0, 0, 0, 0.5) 100%)`
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }
}, [playlist])

  function isTrackCurrentlyPlaying(track) {
    return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
  }

  async function loadPlaylist() {
    try {
      const playlist = await spotifyService.getTracksPlaylist(params.playlistId)
      // console.log('playlist:', playlist)
      setPlaylist(playlist)
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

//   function isTrackCurrentlyPlaying(track) {
//     return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
//   }

  async function getYoutubeId(str) {
  
    try {
      const res = await youtubeService.getVideos(encodeURIComponent(str))
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }
  async function onPlay(track) {
    
    try {
      // Clear existing playlist
      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }

      // Get YouTube ID for the track
      const youtubeId = await getYoutubeId(track.name + ' ' + track.artists[0]?.name)
      const trackWithYoutube = {
        ...track,
        youtubeId,
      }
      // console.log('trackWithYoutube:', trackWithYoutube)
      // Set single track as playlist and play it
      await setTracks(playlist.tracks)
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing track:', err)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }


  async function onResume() {
    await setIsPlaying(true)
  }
  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }

  async function onAddToLikedSongs(track) {
    try {
      const likedSongs = stations.find((station) => station.title === 'Liked Songs')
      if (!likedSongs) return

      const isTrackInLikedSongs = likedSongs.tracks.some((t) => t.spotifyId === track.spotifyId)
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
        tracks: [...likedSongs.tracks, cleanTrack],
      }

      await updateStation(updatedLikedSongs)
    } catch (err) {
      console.error('Error adding track to Liked Songs:', err)
    }

  }



  if (!playlist) return <div>Loading playlist...</div>
  return (
    <section className="playlist-container station-filter">
      <div className="playlist-header">
        {playlist.playlist.imgUrl && (
          <img src={playlist.playlist.imgUrl} alt={playlist.playlist.name} className="playlist-cover" />
        )}
        <div className="playlist-info">
          <p>{playlist.playlist.isPublic}</p>
          <h1 className='playlist-name'>{playlist.playlist.name}</h1>
          <p className='playlist-description'>{playlist.playlist.description}</p>
          <div className="playlist-meta">
            <img className="owner-profile-img" src={playlist.playlist.ownerProfileImg} alt={playlist.playlist.owner} />
            <span>{playlist.playlist.owner}</span>
            <span> • </span>
            <span>{playlist.playlist.followers} saves </span>
            <span> • </span>
            <span>{playlist.playlist.tracksTotal} songs </span>
          </div>
        </div>
        
      </div>

           <div className="station-btns-container">
        <div className="action-btns">
          {(isPlaying && playlist.tracks.map(track => track.name === currentTrack.name).includes(true)) ? (
            <button
              onClick={onPause}
              className="play-btn"
            >
              <SvgIcon iconName="pause" className="pause" />
            </button>
          ) : (
            <button
              onClick={() => {
                // If there's a current track from this station that's paused, just resume
                if (currentTrack && !isPlaying) {
                  onResume()
                } else {
                  // Otherwise start playing from first track
                  onPlay(playlist.tracks[0])
                }
              }}
              className="play-btn"
              // disabled={!station.tracks || station.tracks.length === 0}
            >
              <SvgIcon iconName="play" className="play" />
            </button>
          )}
          {/* <SvgIcon iconName="shuffle" /> */}
        </div>
      </div>


      <section className="track-list">
        <div className="track-header">
          <div className="first-col-header">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="duration-header-icon">
            <SvgIcon iconName="duration" className="duration" />
          </div>
        </div>

          {playlist.tracks.map((track, idx) => (
          <div
            className="track-row"
            key={track.spotifyId ? `${track.spotifyId}-${idx}` : `track-${idx}`}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="track-num ">
              {isTrackCurrentlyPlaying(track) ? (
                hoveredTrackIdx === idx ? (
                  <SvgIcon iconName="pause" className="pause" onClick={() => onPause()} />
                ) : (
                  <SvgIcon iconName="equalizer" className="equalizer" />
                )
              ) : hoveredTrackIdx === idx ? (
                <SvgIcon iconName="play" className="play" onClick={() => onPlay(track)} />
              ) : (
                idx + 1
              )}
            </div>

            <div className="track-title">
              {track.album?.imgUrl && (
                <img src={track.album.imgUrl} alt={`${track.name} cover`} className="track-img" />
              )}
              <div className="track-text">
                <span className={`track-name ${currentTrack?.name===track.name ? 'playing':''} `} >{track.name}</span>
                <div className="track-artists">
                  <span>{track.artists[0].name}</span>
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
              <span className="track-duration">{track.duration}</span>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}
