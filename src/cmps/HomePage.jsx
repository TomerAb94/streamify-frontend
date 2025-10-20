import { useEffect,useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { NavLink,useNavigate } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'
import { useSelector } from 'react-redux'
import { youtubeService } from '../services/youtube.service'
import { setTracks, setCurrentTrack, setIsPlaying } from '../store/actions/track.actions'

export function HomePage() {
  const { stations } = useOutletContext()

  const [albums, setAlbums] = useState([])
  const [isTrackOnHoveredPlaylist, setIsTrackOnHoveredPlaylist] = useState(false)
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
    const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)
    const playListToPlay = useSelector((storeState) => storeState.trackModule.tracks)


  useEffect(() => {
    loadNewAlbumsReleases() 
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
 

  async function loadNewAlbumsReleases() {
  const { albums } = await spotifyService.getNewAlbumsReleases()
  setAlbums(albums)
}

 async function onPlayFromOutside(event, albumId) {
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
  
    async function onCheckCurrnetTrackOnList(currentTrack, spotifyPlaylistId) {
      // console.log('currentTrack:', currentTrack)
      // console.log('spotifyPlaylistId:', spotifyPlaylistId)
      if (!currentTrack) return
      // console.log('currentTrack:', currentTrack.spotifyPlaylistId)
      // console.log('spotifyPlaylistId:', spotifyPlaylistId)
      if (currentTrack.spotifyAlbumId === spotifyPlaylistId) {
        setIsTrackOnHoveredPlaylist(true)
      }
      else {
        setIsTrackOnHoveredPlaylist(false)
      }
    }
  


  if (!stations || !albums) {
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
        {albums.map((album) => (
          <NavLink key={album.id} to={`/album/${album.id}`} className="album-item playlist-item">
            <div className="album-img-container playlist-img-container" onMouseEnter={() => onCheckCurrnetTrackOnList(currentTrack, album.id)}>
              {album.images?.[0]?.url && <img src={album.images[0].url} alt={album.name} />}
                   {isPlaying  && isTrackOnHoveredPlaylist ? (
                  <SvgIcon iconName="pause" className="pause-container" onClick={(event) => onPause(event)} />
                ) : (
                  <SvgIcon
                    iconName="play"
                    className="play-container"
                    onClick={(event) => onPlayFromOutside(event, album.id)}
                  />
                )}
            </div>
            <h3 className="album-name playlist-name">{album.name}</h3>
            <h4 className="album-artists playlist-description">{album.artists.map(artist => artist.name).join(', ')}</h4>
          </NavLink>
        ))}
      </div>
    </section>
  )
}
