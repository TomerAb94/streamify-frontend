import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { NavLink } from 'react-router-dom'
import { spotifyService } from '../services/spotify.service'
import { TrackList } from './TrackList'
import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
  setCurrentStationId,
} from '../store/actions/track.actions'
import { youtubeService } from '../services/youtube.service'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

export function StationSearch() {
  const params = useParams()
  const navigate = useNavigate()

  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

  const [searchedAll, setSearchedAll] = useState({
    tracks: [],
    artists: [],
    albums: [],
  })
  const [currentlyPlayingAlbum, setCurrentlyPlayingAlbum] = useState(null)
  const [currentlyPlayingArtist, setCurrentlyPlayingArtist] = useState(null)

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

  function handleNavToArtists() {
    navigate(`/search/artists/${params.searchStr}`)
  }

  async function onPlay(track) {
    try {
      // Clear currently playing album and artist since we're playing a single track
      setCurrentlyPlayingAlbum(null)
      setCurrentlyPlayingArtist(null)
      setCurrentStationId(null)

      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      // Get YouTube ID for the track
      const youtubeId = await getYoutubeId(track.name)
      console.log(youtubeId)

      const trackWithYoutube = {
        ...track,
        youtubeId,
      }

      // Set single track as playlist and play it
      await setTracks([trackWithYoutube])
      await setCurrentTrack(trackWithYoutube)
      await setIsPlaying(true)
    } catch (err) {
      console.error('Error playing track:', err)
    }
  }

  async function onPause() {
    await setIsPlaying(false)
  }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getVideos(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  function isArtistCurrentlyPlaying(artist) {
    if (!currentTrack || !artist) return false
    
    // Check if this specific artist is the one we set as currently playing
    return currentlyPlayingArtist?.spotifyId === artist.spotifyId && isPlaying
  }

  function isAlbumCurrentlyPlaying(album) {
    if (!currentTrack || !album) return false
    
    // Check if this specific album is the one we set as currently playing
    return currentlyPlayingAlbum?.spotifyId === album.spotifyId && isPlaying
  }

  async function onPlayArtist(artist) {
    try {
      setCurrentlyPlayingArtist(artist)
      setCurrentlyPlayingAlbum(null)
      setCurrentStationId(artist.spotifyId)

      // Get full artist data including top tracks
      const fullArtistData = await spotifyService.getArtistData(artist.spotifyId)
      
      // Clear existing playlist
      if (playlist && playlist.length) {
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

  async function onPlayAlbum(album) {
    try {
      // Set this album as currently playing and clear artist
      setCurrentlyPlayingAlbum(album)
      setCurrentlyPlayingArtist(null)
      setCurrentStationId(album.spotifyId)

      // Get full album data including tracks
      const fullAlbumData = await spotifyService.getAlbumNewRelease(album.spotifyId)
      
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      const playlistQueue = await Promise.all(
        fullAlbumData.tracks.map(async (track, index) => {
          return {
            ...track,
            nextId:
              index < fullAlbumData.tracks.length - 1
                ? fullAlbumData.tracks[index + 1].spotifyId
                : fullAlbumData.tracks[0].spotifyId,
            prevId:
              index > 0
                ? fullAlbumData.tracks[index - 1].spotifyId
                : fullAlbumData.tracks[fullAlbumData.tracks.length - 1].spotifyId,
            youtubeId: await getYoutubeId(track.name + ' ' + track.artists[0]?.name),
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
      console.error('Error playing album tracks:', err)
    }
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
        <button className="nav-button" onClick={handleNavToArtists}>
          Artists
        </button>
      </nav>

      <section className="search-results">
        <div className="results-container">
          <div className="top-result">
            <h2>Top result</h2>

            <NavLink
              to={`/artist/${searchedAll.artists[0]?.spotifyId}`}
              className="top-result-item"
            >
              <img
                src={searchedAll.artists[0]?.imgUrl}
                alt={searchedAll.artists[0]?.name}
              />
              <div className="mini-info">
                <h2>{searchedAll.artists[0]?.name}</h2>
                <span>Artist</span>
              </div>
              <span className="btn-container">
                {isArtistCurrentlyPlaying(searchedAll.artists[0]) && isPlaying ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onPause()
                    }}
                    className="play-btn"
                  >
                    <SvgIcon iconName="pause" className="pause" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onPlayArtist(searchedAll.artists[0])
                    }}
                    className="play-btn"
                  >
                    <SvgIcon iconName="play" className="play" />
                  </button>
                )}
              </span>
            </NavLink>
          </div>

          <div className="songs-result">
            <h2>Songs</h2>
            <div className="songs-list">
              <TrackList
                tracks={searchedAll.tracks}
                onPlay={onPlay}
                onPause={onPause}
              />
            </div>
          </div>

          <div className="artist-result">
            <h2>Artists</h2>

            <div className="artists-container">
              {searchedAll.artists.map((artist) => (
                <NavLink
                  key={artist.id}
                  to={`/artist/${artist.spotifyId}`}
                  className="artist-item"
                >
                  <img src={artist.imgUrl} alt={artist.name} />
                  <div className="mini-info">
                    <h3>{artist.name}</h3>
                    <span>Artist</span>
                  </div>
                  <span className="btn-container">
                    {isArtistCurrentlyPlaying(artist) && isPlaying ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPause()
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="pause" className="pause" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPlayArtist(artist)
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="play" className="play" />
                      </button>
                    )}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="album-result">
            <h2>Albums</h2>

            <div className="albums-container">
              {searchedAll.albums.map((album) => (
                <NavLink
                  key={album.spotifyId}
                  to={`/album/${album.spotifyId}`}
                  className="album-item"
                >
                  <img src={album.imgUrl} alt={album.name} />
                  <div className="mini-info">
                    <h3>{album.name}</h3>
                    <span className="mini-data">
                      {album.releaseYear} &#8226; {album.artist}
                    </span>
                  </div>
                  <span className="btn-container">
                    {isAlbumCurrentlyPlaying(album) && isPlaying ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPause()
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="pause" className="pause" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onPlayAlbum(album)
                        }}
                        className="play-btn"
                      >
                        <SvgIcon iconName="play" className="play" />
                      </button>
                    )}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}
