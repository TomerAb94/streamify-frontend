import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { spotifyService } from '../services/spotify.service'
import { TrackList } from './TrackList'

export function StationSearch() {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchedAll, setSearchedAll] = useState({
    tracks: [],
    artists: [],
    albums: [],
  })

  useEffect(() => {
    async function fetchSearchResults() {
      if (params.searchStr) {
        await loadSearchedAll()
        console.log(searchedAll)
      }
    }

    fetchSearchResults()
  }, [params.searchStr])

  async function loadSearchedAll() {
    try {
      const spotifyTracks = await spotifyService.getSearchedTracks(
        params.searchStr,
        4
      )
      const spotifyArtists = await spotifyService.getSearchArtists(
        params.searchStr
      )
      const spotifyAlbums = await spotifyService.getSearchedAlbums(
        params.searchStr
      )
      const combinedResults = {
        tracks: spotifyTracks,
        artists: spotifyArtists,
        albums: spotifyAlbums,
      }
      setSearchedAll(combinedResults)
    } catch (err) {
      console.error('Error loading all search results:', err)
    }
  }

  function handleNavToSongs() {
    navigate(`/search/tracks/${params.searchStr}`)
  }

  function handleNavToAll() {
    navigate(`/search/${params.searchStr}`)
  }

  if (
    !searchedAll.tracks.length &&
    !searchedAll.artists.length &&
    !searchedAll.albums.length &&
    params.searchStr
  ) {
    return <div>Loading...</div>
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

      <section className="search-results">
        <div className="results-container">
          <div className="top-result">
            <h2>Top result</h2>

            <div className="top-result-item">
              <img
                src={searchedAll.artists[0]?.imgUrl}
                alt={searchedAll.artists[0]?.name}
              />
              <div className="mini-info">
                <h2>{searchedAll.artists[0]?.name}</h2>
                <span>Artist</span>
              </div>
            </div>
          </div>

          <div className="songs-result">
            <h2>Songs</h2>
            <div className="songs-list">
              <TrackList tracks={searchedAll.tracks} />
            </div>
          </div>

          <div className="artist-result">
            <h2>Artists</h2>

            <div className="artists-container">
              {searchedAll.artists.map((artist) => (
                <div key={artist.id} className="artist-item">
                  <img src={artist.imgUrl} alt={artist.name} />
                  <div className="mini-info">
                    <h3>{artist.name}</h3>
                    <span>Artist</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="album-result">
            <h2>Albums</h2>

            <div className="albums-container">
              {searchedAll.albums.map((album) => (
                <div key={album.id} className="album-item">
                  <img src={album.imgUrl} alt={album.name} />
                  <div className="mini-info">
                    <h3>{album.name}</h3>
                    <span className="mini-data">
                      {album.releaseYear} &#8226; {album.artist}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
