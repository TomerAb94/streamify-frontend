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

<div className='stations-type'>
    <button>All</button>
    <button>Music</button>
    <button>Podcasts</button>
    
</div>

<div className='user-stations'>
    {stations.map((station) => (
        <li key={station._id} className='user-station'>
                  {station.stationImgUrl ? (
                     <img
                       className="station-img"
                       src={station.stationImgUrl}
                       alt={`${station.title} Cover`}
                     />
                   ) : (
                     <div className="station-img-placeholder">
                       <SvgIcon iconName="musicNote" />
                     </div>
                   )}
            {station.title}
            </li>
      ))}
</div>
      
    </section>
  )
}
