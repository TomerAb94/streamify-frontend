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

export function StationDetails() {
  const { stationId } = useParams()
  const station = useSelector((storeState) => storeState.stationModule.station)

  const [searchBy, setSearchBy] = useState('')
  const [searchedTracks, setSearchedTracks] = useState([])

  useEffect(() => {
    loadStation(stationId)
  }, [stationId])

  // useEffect(() => {
  //   if (searchBy.length > 0) {
  //     loadSearchedTracks()
  //   }
  // }, [searchBy])

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
  }, [stationId])

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
      const res = await spotifyService.searchTracks(searchTerm)
      setSearchedTracks(res.tracks.items)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  async function onAddTrack(track) {
    const stationToSave = { ...station }
    console.log('Adding track to station:', stationToSave)
    stationToSave.songs.push(track)

    try {
      await updateStation(stationToSave)
      showSuccessMsg('Track added successfully!')
    } catch (err) {
      showErrorMsg('Failed to add track')
    }
  }

  if (!station) return <div>Loading...</div>

  return (
    <section className="station-details">
      <div className="background">
        <header className="details-header">
          <div className="background"></div>
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
              <span className="songs-count">{station.songs.length} songs</span>
            </div>
          </div>
        </header>

        <div className="station-btns-container">
          <div className="action-btns">
            <button className="play-btn">
              <SvgIcon iconName="play" className="play" />
            </button>
            {/* <SvgIcon iconName="shuffle" /> */}
          </div>
        </div>

        <div className="song-list">
          {station.songs.length === 0 && (
            <div className="no-songs">
              <h2>Let's find something for your playlist</h2>

              <div className="search-wrapper">
                <SvgIcon iconName="magnifyingGlass" />

                <input
                  className="no-songs-input"
                  type="text"
                  name="upper-search"
                  id="upper-search"
                  placeholder="Search for songs?"
                  onInput={(ev) => {
                    handleInput(ev)
                  }}
                />
              </div>

              {searchedTracks.length > 0 && (
                <div>
                  <ul>
                    {searchedTracks.map((track) => (
                      <li className="track-preview" key={track.id}>
                        <div>
                          {track.album?.images?.[0]?.url && (
                            <img
                              src={track.album.images[0].url}
                              alt={`${track.name} cover`}
                              width={50}
                            />
                          )}
                        </div>
                        <div
                          className="track-info"
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <span className="track-name">{track.name}</span>
                          <span className="artist-name">
                            {track.artists[0].name}
                          </span>
                        </div>

                        <span className="album-name">{track.album.name}</span>

                        <div>
                          <button onClick={() => onAddTrack(track)}>Add</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
