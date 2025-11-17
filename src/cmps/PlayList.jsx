import { useEffect, useState } from 'react'
import { spotifyService } from '../services/spotify.service'
import { Link, NavLink, useLocation, useParams, useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { FastAverageColor } from 'fast-average-color'
import { youtubeService } from '../services/youtube.service'
import { setTracks, setCurrentTrack, setIsPlaying, setIsShuffle } from '../store/actions/track.actions'

import { updateStation } from '../store/actions/station.actions'
import { useSelector } from 'react-redux'
import { Loader } from './Loader'

export function PlayList() {
  const { onOpenStationsContextMenu, onCloseStationsContextMenu } = useOutletContext()
  const params = useParams()
  const [playlist, setPlaylist] = useState(null)

  const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint)

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= breakpoint)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [breakpoint])

    return isMobile
  }

  const isMobile = useIsMobile()

  const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const isShuffle = useSelector((storeState) => storeState.trackModule.isShuffle)
  const stations = useSelector((storeState) => storeState.stationModule.stations)
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)
  const [clickedTrackId, setClickedTrackId] = useState(null)

  useEffect(() => {
    loadPlaylist()
  }, [params.playlistId])

  useEffect(() => {
    if (playlist?.playlist?.imgUrl) {
      const fac = new FastAverageColor()
      const imgElement = document.querySelector('.playlist-cover')
      const background = document.querySelector('.playlist-header')
      const backgroundTrackList = document.querySelector('.background-track-list')
      const stickyPlayBtnWrapper = document.querySelector('.sticky-play-btn-wrapper')

      if (imgElement) {
        imgElement.crossOrigin = 'Anonymous'
        fac
          .getColorAsync(imgElement, { algorithm: 'sqrt' })
          .then((color) => {
            background.style.backgroundColor = color.rgba
            // console.log('color.rgba:', color.rgba)
            background.style.backgroundImage = `linear-gradient(in oklch to bottom, ${color.rgba}, transparent), none`
            backgroundTrackList.style.backgroundImage = `linear-gradient(to top, rgba(18, 18, 18, 0.6) 0%, ${color.rgba} 300%), var(--background-noise)`
            stickyPlayBtnWrapper.style.background = `
            linear-gradient(rgba(0, 0, 0) -80%, ${color.rgba} 300%)
          `
          })
          .catch((e) => {
            console.log(e)
          })
      }
    }
  }, [playlist])

  useEffect(() => {
    const mainPlayBtn = document.querySelector('.main-play-btn')
    const stickyWrapper = document.querySelector('.sticky-play-btn-wrapper')
    const stickyContainer = document.querySelector('.sticky-play-btn-container')
    const container = document.querySelector('.playlist-container')

    if (!mainPlayBtn || !stickyWrapper || !stickyContainer || !container) return

    // IntersectionObserver for setting container opacity when mainPlayBtn is out of frame
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            stickyContainer.style.opacity = '1'
          } else {
            stickyContainer.style.opacity = '0'
          }
        })
      },
      { root: container, rootMargin: '-100px 0px 0px 0px' }
    )

    observer.observe(mainPlayBtn)

    // Scroll listener for progressive opacity on wrapper and immediate height change
    const handleScroll = () => {
      const scrollTop = container.scrollTop
      let opacity = 0
      if (scrollTop > 50) opacity = 0.45
      if (scrollTop > 100) opacity = 0.65
      if (scrollTop > 200) opacity = 1
      stickyWrapper.style.opacity = opacity

      // Change height immediately on first scroll
      if (scrollTop > 0) {
        stickyWrapper.classList.add('height')
      } else {
        stickyWrapper.classList.remove('height')
      }
    }

    container.addEventListener('scroll', handleScroll)

    // Cleanup
    return () => {
      observer.disconnect()
      container.removeEventListener('scroll', handleScroll)
    }
  }, [playlist])

  function isTrackCurrentlyPlaying(track) {
    return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
  }

  async function loadPlaylist() {
    try {
      if (params.albumId) {
        const playlist = await spotifyService.getSpotifyItems('getAlbumNewRelease', params.albumId)
        setPlaylist(playlist)
      } else if (params.playlistId) {
        const playlist = await spotifyService.getSpotifyItems('getTracksPlaylist', params.playlistId)
        setPlaylist(playlist)
      }
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

  //   function isTrackCurrentlyPlaying(track) {
  //     return currentTrack && currentTrack.spotifyId === track.spotifyId && isPlaying
  //   }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getYoutubeItems(str)
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

  function handleRowClick(track) {
    setClickedTrackId(track.spotifyId)
  }

  function isTrackInStation(track) {
    return stations.some((s) => s.tracks && s.tracks.some((t) => t.spotifyId === track.spotifyId))
  }

  function handleOpenStationsContextMenu(ev, track) {
    ev.stopPropagation()
    setClickedTrackId(track.spotifyId)
    onOpenStationsContextMenu(track, ev.clientX, ev.clientY)
  }

  function handleCloseStationsContextMenu(ev) {
    ev.stopPropagation()
    onCloseStationsContextMenu()
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

  async function onShuffle() {
    // Toggle shuffle state
    const newShuffleState = !isShuffle
    setIsShuffle(newShuffleState)

    // Need playlist tracks to shuffle
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return

    // Clear existing playlist
    if (playListToPlay && playListToPlay.length) {
      await setTracks([])
    }

    let tracksToPlay = []

    if (newShuffleState) {
      // If turning shuffle ON, create shuffled playlist
      tracksToPlay = [...playlist.tracks].sort(() => Math.random() - 0.5)
    } else {
      // If turning shuffle OFF, restore original chronological order
      tracksToPlay = [...playlist.tracks]
    }

    // Create playlist with proper nextId and prevId based on current order
    // Don't fetch YouTube IDs here - only fetch when track is actually played
    const playlistQueue = tracksToPlay.map((track, index) => {
      return {
        ...track,
        nextId: index < tracksToPlay.length - 1 ? tracksToPlay[index + 1].spotifyId : tracksToPlay[0].spotifyId,
        prevId: index > 0 ? tracksToPlay[index - 1].spotifyId : tracksToPlay[tracksToPlay.length - 1].spotifyId,
        // Don't add youtubeId here - will be added when track is played
      }
    })

    // Set the new playlist (shuffled or chronological)
    await setTracks(playlistQueue)

    // If turning shuffle ON, start playing the first track
    // If turning shuffle OFF, keep current track but update its connections
    if (newShuffleState) {
      const firstTrack = playlistQueue[0]
      if (firstTrack) {
        // Only fetch YouTube ID for the track that will actually be played
        const youtubeId = await getYoutubeId(firstTrack.name + ' ' + firstTrack.artists[0]?.name)
        const trackWithYoutube = {
          ...firstTrack,
          youtubeId,
        }
        await setCurrentTrack(trackWithYoutube)
        await setIsPlaying(true)
      }
    } else {
      // When turning shuffle OFF, update current track with new next/prev connections
      if (currentTrack) {
        const updatedCurrentTrack = playlistQueue.find((track) => track.spotifyId === currentTrack.spotifyId)
        if (updatedCurrentTrack) {
          // Keep existing YouTube ID if it exists
          const trackWithYoutube = {
            ...updatedCurrentTrack,
            youtubeId: currentTrack.youtubeId || null,
          }
          await setCurrentTrack(trackWithYoutube)
        }
      }
    }
  }

  if (!playlist)
    return (
      <section className="playlist-container">
        <div className="loader-center">
          <Loader />
        </div>
      </section>
    )

  return (
    <section className="playlist-container station-search">
      <div className="sticky-play-btn-wrapper">
        <div className="sticky-play-btn-container">
          {isPlaying && playlist.tracks.map((track) => track.name === currentTrack.name).includes(true) ? (
            
            <>
          
             <div>{`${currentTrack.album?.name || ''}`}</div>
            <button onClick={onPause} className=" sticky-play-btn">
              <SvgIcon iconName="pause" className="pause" />
            </button>
            </>
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
              className="sticky-play-btn"
              // disabled={!station.tracks || station.tracks.length === 0}
            >
              <SvgIcon iconName="play" className="play" />
            </button>
          )}
          <span className="station-title">{playlist.title}</span>
        </div>
      </div>

      <div className="playlist-header">
        {playlist.playlist.imgUrl && (
          <img src={playlist.playlist.imgUrl} alt={playlist.playlist.name} className="playlist-cover" />
        )}
        <div className="playlist-info">
          <p className="playlist-public">{playlist.playlist.isPublic}</p>
          <h1 className="playlist-name">{playlist.playlist.name}</h1>
          <p className="playlist-description">{playlist.playlist.description}</p>
          <div className="playlist-meta">
            <img
              className="owner-profile-img"
              src={playlist.playlist.ownerProfileImg || playlist.playlist.artists[0]?.imgUrl}
              alt={playlist.playlist.owner}
            />
            <span>{playlist.playlist.owner || playlist.playlist.artists[0]?.name}</span>
            <span> • </span>
            {playlist.playlist.followers < 1000 ? (
              <span>{playlist.playlist.followers} saves </span>
            ) : (
              <span>{playlist.tracks.length} songs </span>
            )}
            {playlist.playlist.followers && <span> • </span>}
            {playlist.playlist.followers && <span>{playlist.playlist.tracksTotal} songs </span>}
          </div>
        </div>
        <div className="background-track-list"></div>
      </div>

      <div className="station-btns-container">
        <div className="action-btns">
          {isPlaying && playlist.tracks.map((track) => track.name === currentTrack.name).includes(true) ? (
            <button onClick={onPause} className="play-btn main-play-btn">
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
              className="play-btn main-play-btn"
              // disabled={!station.tracks || station.tracks.length === 0}
            >
              <SvgIcon iconName="play" className="play" />
            </button>
          )}
          <button className={`shuffle-btn ${isShuffle ? 'active' : ''}`} onClick={() => onShuffle()}>
            <SvgIcon iconName="shuffle" />
          </button>
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
            className={`track-row ${clickedTrackId === track.spotifyId ? 'clicked' : ''}`}
            key={track.spotifyId ? `${track.spotifyId}-${idx}` : `track-${idx}`}
            onMouseEnter={() => handleMouseEnter(idx)}
            onMouseLeave={handleMouseLeave}
            onClick={(ev) => {
              handleCloseStationsContextMenu(ev)
              handleRowClick(track)
              onPlay(track)
            }}
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

              {isMobile && isTrackCurrentlyPlaying(track) ? (
                <div className="track-text">
                  <SvgIcon iconName="equalizer" className="equalizer" />
                  <NavLink to={`/track/${track.spotifyId}`} className={`track-name nav-link ${currentTrack?.spotifyId === track.spotifyId ? 'playing' : ''}`}>
                    {track.name}
                  </NavLink>
                 
                
                
                  <div className="track-artists">
                    <NavLink key={track.artists[0].id[0]} to={`/artist/${track.artists[0].id[0]}`}>
                      <span className="nav-link">{track.artists[0].name}</span>
                    </NavLink>
                  </div>
                </div>
              ) : (
                <div className="track-text">
                  <div to={`/track/${track.spotifyId}`} className={`track-name nav-link ${currentTrack?.spotifyId === track.spotifyId ? 'playing' : ''}`}>
                    {track.name}
                  </div>
                  <div className="track-artists">
                    <NavLink key={track.artists[0].id[0]} to={`/artist/${track.artists[0].id[0]}`}>
                      <span className="nav-link">{track.artists[0].name}</span>
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            <div className="track-album">
              <NavLink to={`/album/${track.album?.spotifyId}`} className="album-name nav-link">
                {track.album?.name}
              </NavLink>
            </div>

            <div className="track-duration-container">
              <SvgIcon
                iconName={isTrackInStation(track) ? 'inStation' : 'addLikedSong'}
                className="add-to-playlist"
                title="Add to Playlist"
                onClick={
                  isTrackInStation(track)
                    ? (ev) => handleOpenStationsContextMenu(ev, track)
                    : () => onAddToLikedSongs(track)
                }
              />
              <span className="track-duration">{track.duration}</span>
            </div>
          </div>
        ))}
      </section>
    </section>
  )
}
