import { useEffect,useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { NavLink,useNavigate } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'

export function HomePage() {
  const { stations } = useOutletContext()

  const [albums, setAlbums] = useState([])

  useEffect(() => {
    loadNewAlbumsReleases() 
  }, [])



 

  async function loadNewAlbumsReleases() {
  const { albums } = await spotifyService.getNewAlbumsReleases()
  setAlbums(albums)
}

  if (!stations || !albums) return <>loading...</>
  return (
    <section className="home">
      <div className="stations-type">
        <button>All</button>
        <button>Music</button>
        <button>Podcasts</button>
      </div>
     <h2>Your Shows</h2>
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


      <div className='new-albums-releases'>
        {albums.map((album) => (
          <NavLink key={album.id} to={`/album/${album.id}`} className="album-item">
            <div className="album-img-container">
              {album.images?.[0]?.url && <img src={album.images[0].url} alt={album.name} />}
            </div>
          </NavLink>
        ))}
      </div>
    </section>
  )
}
