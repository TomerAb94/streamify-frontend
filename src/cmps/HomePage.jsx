import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'

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
          <li key={station._id} className="user-station">
            {station.stationImgUrl ? (
              <img className="station-img" src={station.stationImgUrl} alt={`${station.title} Cover`} />
            ) : (
              <div className="station-img-placeholder">
                <SvgIcon iconName="musicNote" />
              </div>
            )}
            {station.title}
            {
              <div className="play-btn">
                <svg className="play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606" />
                </svg>
              </div>
            }
          </li>
        ))}
       
        
      </div>
       <section>
        <h2>Your Shows</h2>
        </section>
    </section>
  )
}
