import { Link } from 'react-router-dom'

export function StationPreview({ station }) {
  return (
    <article className="station-preview">
        <h1>Station-Preview</h1>
      {/* <header>
            <Link to={`/station/${station._id}`}>{station.title}</Link>
        </header>

        {station.owner && <p>Owner: <span>{station.owner.fullname}</span></p>}
         */}
    </article>
  )
}
