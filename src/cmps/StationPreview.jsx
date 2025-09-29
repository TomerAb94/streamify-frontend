import { Link } from 'react-router-dom'

export function StationPreview({ station }) {
  return (
    <article className="station-preview">
      <p>{station.title}</p>
      {/* <header>
            <Link to={`/station/${station._id}`}>{station.title}</Link>
        </header>

        {station.owner && <p>Owner: <span>{station.owner.fullname}</span></p>}
         */}
    </article>
  )
}
