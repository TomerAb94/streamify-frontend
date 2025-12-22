import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { NavLink, useNavigate } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'
import { useSelector } from 'react-redux'
import { youtubeService } from '../services/youtube.service'
import { setTracks, setCurrentTrack, setIsPlaying,setCurrentStationId} from '../store/actions/track.actions'

import { Loader } from './Loader'
import { FastAverageColor } from 'fast-average-color'
export function HomePage() {
  const { stations } = useOutletContext()

  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [hoveredStationId, setHoveredStationId] = useState(null)
  
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)
  const currentStationId = useSelector((storeState) => storeState.trackModule.currentStationId)
   const loggedInUser = useSelector((storeState) => storeState.userModule.user)
  //  const stations = useSelector((storeState) => storeState.stationModule.stations)
  useEffect(() => {
    loadNewAlbumsReleases()
    loadArtistToHomePage()
  }, [loggedInUser])



     

  useEffect(() => {
     const fac = new FastAverageColor()
    const imgElement = document.querySelector(`.station-img[data-station-id="${hoveredStationId || currentStationId}"]`)
    const background = document.querySelector('.user-stations-background')
    if (!currentStationId)
      { 
        background.style.backgroundColor = 'rgb(116, 95, 232)'
        background.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.6) 0, #121212 100%), var(--background-noise)';
      }




    if (imgElement && background) {
      imgElement.crossOrigin = 'Anonymous'
      fac
        .getColorAsync(imgElement, { algorithm: 'dominant' })
        .then((color) => {
          background.style.backgroundColor = color.rgba
          // background-image: linear-gradient(rgba(0, 0, 0, .6) 0, #121212 100%), var(--background-noise);
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }, [hoveredStationId, currentStationId])



  async function loadPlaylist(albumId) {
    try {
      const playlist = await spotifyService.getSpotifyItems('getAlbumNewRelease',albumId)
      // console.log('playlist:', playlist)
      return playlist
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

  async function loadArtists() {
    try {
      const artists = await spotifyService.getSpotifyItems('artists', 'האמנים המובילים של ישראל')
      // console.log('artists:', artists)
      return artists
    } catch (error) {
      console.error('Failed loading artists:', error)
    }
  }

  async function loadNewAlbumsReleases() {
    const { albums } = await spotifyService.getSpotifyItems('albumReleases')
    setAlbums(albums)
  }

  async function loadArtistToHomePage() {
    const artists = await loadArtists()
    setArtists(artists)
  }

  async function onPlayAlbumFromOutside(event, albumId) {
    event.preventDefault()
    try {
      const playlistSpotifyDetails = await loadPlaylist(albumId)
      const { tracks, playlist } = playlistSpotifyDetails

      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }
      const youtubeId = await getYoutubeId(tracks[0].name + ' ' + tracks[0].artists[0]?.name)
      const trackWithYoutube = {
        ...tracks[0],
        youtubeId,
      }

      // Implement play logic here
      await setTracks(tracks)
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing :', err)
    }
  }

  async function onPlayArtist(event, artist) {
    event.preventDefault()
    try {
      // Set this artist as currently playing and clear album
      // Get full artist data including top tracks
      const fullArtistData = await spotifyService.getSpotifyItems('artistData',artist.spotifyId)

      // Clear existing playlist
      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }

      console.log('fullArtistData:', fullArtistData)

      const playlistQueue = await Promise.all(
        fullArtistData.topTracks.map(async (track, index) => {
          return {
            ...track,
            nextId:
              index < fullArtistData.topTracks.length - 1
                ? fullArtistData.topTracks[index + 1].spotifyId
                : fullArtistData.topTracks[0].spotifyId,
            prevId:
              index > 0
                ? fullArtistData.topTracks[index - 1].spotifyId
                : fullArtistData.topTracks[fullArtistData.topTracks.length - 1].spotifyId,
            
            youtubeId: await getYoutubeId(track.artists[0]?.name + ' ' + track.name),
            spotifyArtistId: artist.spotifyId,
          }
        })
      )
      
      // Set the entire playlist at once
      await setTracks(playlistQueue)
      console.log('playlistQueue:', playlistQueue)
      // Set the first track and start playing
      const firstTrack = playlistQueue[0]
      if (firstTrack) {
        await setCurrentTrack(firstTrack)
        await setIsPlaying(true)
      }
    } catch (err) {
      console.error('Error playing artist tracks:', err)
    }
  }

  async function getYoutubeId(str) {
    console.log('str:', str)
    try {
      const res = await youtubeService.getYoutubeItems(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  async function onPause(event) {
    event.preventDefault()
    await setIsPlaying(false)
    await setCurrentStationId(null)
  }

  function isTrackPlayingFromArtistOrAlbum(artistOrAlbumId) {
    if (!currentTrack || !isPlaying) return false
    // Only show pause if playing directly from artist/album, not from playlist
    if (currentTrack?.playlistId) return false
    return (
      currentTrack?.spotifyAlbumId === artistOrAlbumId ||
      currentTrack?.spotifyArtistId === artistOrAlbumId
    )
  }

  function isTrackPlayingFromPlaylist(playlistId) {
    if (!currentTrack || !isPlaying) return false
    return currentTrack?.playlistId === playlistId
  }

  function onHoverImg(stationId) {
    setHoveredStationId(stationId)
  }

  function onHoverLeave() {
    setHoveredStationId(null)
  }

  async function onPlayStationFromOutside(event, stationId) {
    event.preventDefault()
    try {
      const { tracks } = await getPlaylistFromStore(stationId)

      const playlistQueue = await Promise.all(
        tracks.map(async (track, index) => {
          return {
            ...track,
            nextId: index < tracks.length - 1 ? tracks[index + 1].spotifyId : tracks[0].spotifyId,
            prevId: index > 0 ? tracks[index - 1].spotifyId : tracks[tracks.length - 1].spotifyId,
            youtubeId: null,
            playlistId: stationId,
          }
        })
      )
      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }
      
      const youtubeId = await getYoutubeId(playlistQueue[0].name + ' ' + playlistQueue[0].artists[0]?.name)
      const trackWithYoutube = {
        ...playlistQueue[0],
        youtubeId,
      }
      // console.log('trackWithYoutube:', trackWithYoutube)

      // console.log('playlistQueue:', playlistQueue)

      // // Implement play logic here
      await setTracks(playlistQueue)
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
      await setCurrentStationId(stationId)
    } catch (err) {
      console.error('Error playing :', err)
    }
  }

  async function getPlaylistFromStore(stationId) {
    const playlist = stations.find((station) => station._id === stationId)

    if (!playlist) return null
    return playlist
  }

  if (!stations || !albums || !artists) {
    return (
      <section className="home">
        <div className="loader-center">
          <Loader />
        </div>
      </section>
    )
  }

  return (
    <section className="home">
      <div className="home-content">
        <div className="user-stations-background"></div>
        <div className="stations-type">
          <button className="active">All</button>
          <button>Music</button>
          <button>Podcasts</button>
        </div>

        <div className="user-stations">
          {stations.map((station) => {
            
            const isStationPlaying = isTrackPlayingFromPlaylist(station._id)
            return (
              <NavLink
                key={station._id}
                to={`/station/${station._id}`}
                className="user-station"
                onMouseEnter={() => onHoverImg(station._id)}
                onMouseLeave={() => onHoverLeave()}
              >
                <div className="img-title-station">
                  {station.stationImgUrl ? (
                    <img
                      className="station-img"
                      data-station-id={station._id}
                      src={station.stationImgUrl}
                      alt={`${station.title} Cover`}
                    />
                  ) : (
                    <div className="station-img-placeholder">
                      <SvgIcon iconName="musicNote" />
                    </div>
                  )}

                  <div className="station-title">{station.title}</div>
                </div>
                {isStationPlaying ? (
                  hoveredStationId === station._id ? (
                    <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
                  ) : (
                    <SvgIcon iconName="equalizer" className="equalizer-svg" />
                  )
                ) : (
                 <SvgIcon
                  iconName="playHomePage"
                  className="play-container"
                  onClick={(event) => onPlayStationFromOutside(event, station._id)}
                />
                )}
              
              </NavLink>
            )
          })}
        </div>

        <h2 className="new-albums-header">New Albums Releases</h2>
        <div className="albums-container playlists-container">
          {albums.map((album) => {
            const isAlbumPlaying = isTrackPlayingFromArtistOrAlbum(album.id)
            return (
              <NavLink
                key={album.id}
                to={`/album/${album.id}`}
                className={`album-item playlist-item ${isAlbumPlaying ? 'playing' : ''}`}
              >
                <div className="album-img-container playlist-img-container">
                  {album.images?.[0]?.url && <img src={album.images[0].url} alt={album.name} />}
                  {isAlbumPlaying ? (
                    <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
                  ) : (
                    <SvgIcon
                      iconName="play"
                      className="play-container"
                      onClick={(event) => onPlayAlbumFromOutside(event, album.id)}
                    />
                  )}
                </div>
                <h3 className="album-name playlist-name">{album.name}</h3>
                <h4 className="album-artists playlist-description">
                  {album.artists.map((artist) => artist.name).join(', ')}
                </h4>
              </NavLink>
            )
          })}
        </div>

        <h2 className="new-artists-header">Artists For you</h2>
        <div className="artists-container">
          {artists.map((artist) => {
            const isArtistPlaying = isTrackPlayingFromArtistOrAlbum(artist.spotifyId)
            return (
              <NavLink
                key={artist.spotifyId}
                to={`/artist/${artist.spotifyId}`}
                className={`artist-item ${isArtistPlaying ? 'playing' : ''}`}
              >
                <div className="artist-img-container playlist-img-container">
                  {artist.imgUrl && <img src={artist.imgUrl} alt={artist.name} />}
                  {isArtistPlaying ? (
                    <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
                  ) : (
                    <SvgIcon
                      iconName="play"
                      className="play-container"
                      onClick={(event) => onPlayArtist(event, artist)}
                    />
                  )}
                </div>
                <div className="mini-info">
                  <h3 className="artist-name">{artist.name}</h3>
                  <span>Artist</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
