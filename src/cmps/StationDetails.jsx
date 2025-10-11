import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { loadStation } from '../store/actions/station.actions'
import { SvgIcon } from './SvgIcon'
import { debounce } from '../services/util.service'
import { spotifyService } from '../services/spotify.service'
import { updateStation } from '../store/actions/station.actions'
import { TrackList } from './TrackList'
import {
  addTrack,
  updateTrack,
  setTracks,
} from '../store/actions/track.actions'
import { youtubeService } from '../services/youtube.service'

export function StationDetails() {
  const { stationId } = useParams()
  const station = useSelector((storeState) => storeState.stationModule.station)
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)

  const [searchBy, setSearchBy] = useState('')
  const [searchedTracks, setSearchedTracks] = useState([])

  useEffect(() => {
    loadStation(stationId)
  }, [stationId])

  useEffect(() => {
    if (station && station.stationImgUrl) {
      const fac = new FastAverageColor()
      const imgElement = document.querySelector('.avg-img')
      const background = document.querySelector('.station-details')

      if (imgElement) {
        imgElement.crossOrigin = 'Anonymous'
        fac
          .getColorAsync(imgElement)
          .then((color) => {
            background.style.backgroundColor = color.rgba
            background.style.background = `linear-gradient(to bottom,${color.rgba}, rgba(0, 0, 0, 0.5) 100%)`
          })
          .catch((e) => {
            console.log(e)
          })
      }
    }
  }, [station])

  function handleInput({ target }) {
    const txt = target.value
    setSearchBy(txt)
    if (txt.length > 0) {
      debounce(() => loadSearchedTracks(txt), 300)()
    } else {
      setSearchedTracks([])
    }
  }

  async function loadSearchedTracks(searchTerm = searchBy) {
    if (!searchTerm) return
    try {
      const spotifyTracks = await spotifyService.getSearchedTracks(searchTerm)
      setSearchedTracks(spotifyTracks)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  async function onAddTrack(track) {
    const stationToSave = { ...station }
    // console.log('Adding track to station:', stationToSave)
    stationToSave.tracks.push(track)

    try {
      await updateStation(stationToSave)
      showSuccessMsg('Track added successfully!')
    } catch (err) {
      showErrorMsg('Failed to add track')
    }
  }

  async function onPlay(track) {
    // Clear existing playlist
    if (playlist && playlist.length) {
      await setTracks([])
    }

    const playlistQueue = await Promise.all(
      station.tracks.map(async (track, index) => {
        // create a new array with nextId and prevId
        return {
          ...track,
          nextId:
            index < station.tracks.length - 1
              ? station.tracks[index + 1].spotifyId
              : station.tracks[0].spotifyId,
          prevId:
            index > 0
              ? station.tracks[index - 1].spotifyId
              : station.tracks[station.tracks.length - 1].spotifyId,
          youtubeId: await getYoutubeId(track.name),
        }
      })
    )

    // find index of the track to play
    const playingTrackIdx = playlistQueue.findIndex(
      (t) => t.spotifyId === track.spotifyId
    )
    if (playingTrackIdx !== -1) {
      playlistQueue[playingTrackIdx].isPlaying = true // set isPlaying to true for the track to play
    }
    // console.log('playlistQueue:', playlistQueue)

    // Set the entire playlist at once instead of adding tracks individually
    await setTracks(playlistQueue)
  }

  function getPlayingTrack() {
    if (!playlist || !playlist.length) return false
    const playingTrack = playlist.find((track) => track.isPlaying)
    return playingTrack ? playingTrack : false
  }

  async function getYoutubeId(str) {
    // console.log('Getting YouTube ID for:', str)
    try {
      const res = await youtubeService.getVideos(str)
      return res?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  async function onPause(track) {
    // console.log('pausing track', track)
    track.isPlaying = false
    const savedTrack = await updateTrack(track)

    await updateTrack(savedTrack)
  }

  if (!station) return <div>Loading...</div>

  return (
    <section className="station-details">
      <header className="details-header">
        <div className="station-img">
          <img
            className="avg-img"
            src={station.stationImgUrl}
            alt="Station Image"
          />
        </div>
        <div className="station-info">
          <span>{station.stationType}</span>
          <h1>{station.title}</h1>
          <div className="creator-info">
            <img src={station.createdBy.imgUrl} alt="Profile Image" />
            <span className="creator-name">{station.createdBy.fullname}</span>
            <span className="tracks-count">{station.tracks.length} tracks</span>
          </div>
        </div>
      </header>

      <div className="station-btns-container">
        <div className="action-btns">
          {getPlayingTrack().isPlaying ? (
            <button
              onClick={() => onPause(getPlayingTrack())}
              className="play-btn"
            >
              <SvgIcon iconName="pause" className="pause" />
            </button>
          ) : (
            <button
              onClick={() => onPlay(station.tracks[0])}
              className="play-btn"
            >
              <SvgIcon iconName="play" className="play" />
            </button>
          )}
          {/* <SvgIcon iconName="shuffle" /> */}
        </div>
      </div>

      <TrackList
        tracks={station.tracks}
        playlist={playlist}
        onPlay={onPlay}
        onPause={onPause}
      />

      <div className="search-tracks">
        <h2>Let's find something for your playlist</h2>

        <div className="search-wrapper">
          <SvgIcon iconName="magnifyingGlass" />

          <input
            className="search-tracks-input"
            type="text"
            name="upper-search"
            id="upper-search"
            placeholder="Search for tracks?"
            onInput={(ev) => {
              handleInput(ev)
            }}
          />

          {searchedTracks.length > 0 && (
            <section className="search-track-list">
              {searchedTracks.map((track, idx) => (
                <div className="search-track-row" key={idx}>
                  <div className="search-track-title">
                    {track.album?.imgUrl && (
                      <img
                        src={track.album.imgUrl}
                        alt={`${track.name} cover`}
                        className="search-track-img"
                      />
                    )}
                    <div className="search-track-text">
                      <span className="search-track-name">{track.name}</span>
                      <div className="search-track-artists">
                        {track.artists.map((artist, i) => (
                          <span key={artist.id}>
                            {artist.name}
                            {i < track.artists.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="search-track-album">{track.album?.name}</div>
                  <div className="btn-container">
                    <button
                      onClick={() => onAddTrack(track)}
                      className="add-btn"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
