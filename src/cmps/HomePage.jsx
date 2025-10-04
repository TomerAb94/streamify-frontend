import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'
import { NavLink } from 'react-router-dom'

export function HomePage() {
  const { stations } = useOutletContext()

  useEffect(() => {
    console.log(stations)
  }, [stations])

  if (!stations) return <>loading...</>
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

            <SvgIcon iconName="play" className="play-container" />
          </NavLink>
        ))}
      </div>
      <section>
        <h2>Your Shows</h2>
      </section>
    </section>
  )
}
