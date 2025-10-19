import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { NavLink, useNavigate } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'
import { useSelector } from 'react-redux'
import { youtubeService } from '../services/youtube.service'
import { setTracks, setCurrentTrack, setIsPlaying } from '../store/actions/track.actions'

export function HomePage() {
  const { stations } = useOutletContext()

  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])

  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
  const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)

  useEffect(() => {
    loadNewAlbumsReleases()
    loadArtistToHomePage()
  }, [])

  async function loadPlaylist(albumId) {
    try {
      const playlist = await spotifyService.getAlbumNewRelease(albumId)
      // console.log('playlist:', playlist)
      return playlist
    } catch (error) {
      console.error('Failed loading playlists:', error)
    }
  }

  async function loadArtists() {
    try {
      const artists = await spotifyService.getSearchArtists('השירים של ישראל')
      // console.log('artists:', artists)
      return artists
    } catch (error) {
      console.error('Failed loading artists:', error)
    }
  }

  async function loadNewAlbumsReleases() {
    const { albums } = await spotifyService.getNewAlbumsReleases()
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
      const fullArtistData = await spotifyService.getArtistData(artist.spotifyId)

      // Clear existing playlist
      if (playListToPlay && playListToPlay.length) {
        await setTracks([])
      }

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
            youtubeId: await getYoutubeId(track.name),
            spotifyArtistId: artist.spotifyId,
          }
        })
      )

      // Set the entire playlist at once
      await setTracks(playlistQueue)

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
    try {
      const res = await youtubeService.getVideos(encodeURIComponent(str))
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  async function onPause(event) {
    event.preventDefault()
    await setIsPlaying(false)
  }

  function isTrackPlayingFromArtistOrAlbum(artistOrAlbumId) {
    if (!currentTrack || !isPlaying) return false
    return currentTrack?.spotifyAlbumId === artistOrAlbumId || currentTrack?.spotifyArtistId === artistOrAlbumId
  }

  if (!stations || !albums || !artists) return <>loading...</>
  return (
    <section className="home">
      <div className="stations-type">
        <button>All</button>
        <button>Music</button>
        <button>Podcasts</button>
      </div>

      <div className="user-stations">
        {stations.map((station) => (
          <NavLink key={station._id} to={`/station/${station._id}`} className="user-station">
            <div className="img-title-station">
              {station.stationImgUrl ? (
                <img className="station-img" src={station.stationImgUrl} alt={`${station.title} Cover`} />
              ) : (
                <div className="station-img-placeholder">
                  <SvgIcon iconName="musicNote" />
                </div>
              )}

              {station.title}
            </div>

            <SvgIcon iconName="playHomePage" className="play-container" />
          </NavLink>
        ))}
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
                  <SvgIcon iconName="play" className="play-container" onClick={(event) => onPlayArtist(event, artist)} />
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
    </section>
  )
}
