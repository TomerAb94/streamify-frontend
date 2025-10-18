import { useParams, useNavigate, useLocation } from 'react-router'

export function StationSearch() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  function handleNavToSongs() {
    navigate(`/search/tracks/${params.searchStr}`)
  }

  function handleNavToAll() {
    navigate(`/search/${params.searchStr}`)
  }

  return (
    <section className="station-search">
      <nav className="search-nav">
        <button className="nav-button active" onClick={handleNavToAll}>
          All
        </button>
        <button className="nav-button" onClick={handleNavToSongs}>
          Songs
        </button>
      </nav>
    </section>
  )
}
