import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { FastAverageColor } from 'fast-average-color'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { loadStation } from '../store/actions/station.actions'
import { SvgIcon } from './SvgIcon'
import { debounce } from '../services/util.service'
import { spotifyService } from '../services/spotify.service'
import { updateStation } from '../store/actions/station.actions'
import { TrackList } from './TrackList'
import {
  setTracks,
  setCurrentTrack,
  setCurrentStationId,
  setIsPlaying,
  setIsShuffle,
} from '../store/actions/track.actions'
import { youtubeService } from '../services/youtube.service'
import { ModalEdit } from './ModalEdit'
import { Loader } from './Loader'

export function StationDetails() {
  const { stationId } = useParams()
  const station = useSelector((storeState) => storeState.stationModule.station)
  const stations = useSelector(
    (storeState) => storeState.stationModule.stations
  )
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
  const isShuffle = useSelector(
    (storeState) => storeState.trackModule.isShuffle
  )
  const currentStationId = useSelector(
    (storeState) => storeState.trackModule.currentStationId
  )

  const [searchBy, setSearchBy] = useState('')
  const [searchedTracks, setSearchedTracks] = useState([])
  const [isModalEditOpen, setIsModalEditOpen] = useState(false)

  useEffect(() => {
    loadStation(stationId)
  }, [stationId])

  // Reload current station when stations array changes (e.g., when tracks are added/removed via context menu)
  useEffect(() => {
    if (station && stations.length > 0) {
      const updatedStation = stations.find((s) => s._id === station._id)
      if (
        updatedStation &&
        JSON.stringify(updatedStation.tracks) !== JSON.stringify(station.tracks)
      ) {
        loadStation(stationId)
      }
    }
  }, [stations, station, stationId])

  useEffect(() => {
    if (station && station.stationImgUrl) {
      const fac = new FastAverageColor()
      const imgElement = document.querySelector('.avg-img')
      const background = document.querySelector('.details-header')
      const backgroundTrackList = document.querySelector('.background-track-list')
      if (imgElement) {
        imgElement.crossOrigin = 'Anonymous'
        fac
          .getColorAsync(imgElement, { algorithm: 'dominant' })
          .then((color) => {
            background.style.backgroundColor = color.rgba
 backgroundTrackList.style.backgroundImage = `
            linear-gradient(to top,rgba(0, 0, 0, 0.6) 0, ${color.rgba} 300%),
            var(--background-noise)
          `
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
    // Set the current station ID
    setCurrentStationId(station._id)
    
    // Clear existing playlist
    if (playlist && playlist.length) {
      await setTracks([])
    }
    setIsShuffle(false)
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

    // Set the entire playlist at once
    await setTracks(playlistQueue)

    // Set the current track and start playing
    const trackToPlay = playlistQueue.find(
      (t) => t.spotifyId === track.spotifyId
    )
    if (trackToPlay) {
      await setCurrentTrack(trackToPlay)
      await setIsPlaying(true)
    }
  }

  async function onShuffle() {
    // Set the current station ID
    setCurrentStationId(station._id)
    
    // Toggle shuffle state
    const newShuffleState = !isShuffle
    setIsShuffle(newShuffleState)

    if (station.tracks.length > 0) {
      // Clear existing playlist
      if (playlist && playlist.length) {
        await setTracks([])
      }

      let tracksToPlay = []

      if (newShuffleState) {
        // If turning shuffle ON, create shuffled playlist
        tracksToPlay = [...station.tracks].sort(() => Math.random() - 0.5)
      } else {
        // If turning shuffle OFF, restore original chronological order
        tracksToPlay = [...station.tracks]
      }

      // Create playlist with proper nextId and prevId based on current order
      const playlistQueue = await Promise.all(
        tracksToPlay.map(async (track, index) => {
          return {
            ...track,
            nextId:
              index < tracksToPlay.length - 1
                ? tracksToPlay[index + 1].spotifyId
                : tracksToPlay[0].spotifyId,
            prevId:
              index > 0
                ? tracksToPlay[index - 1].spotifyId
                : tracksToPlay[tracksToPlay.length - 1].spotifyId,
            youtubeId: await getYoutubeId(track.name),
          }
        })
      )

      // Set the new playlist (shuffled or chronological)
      await setTracks(playlistQueue)

      // If turning shuffle ON, start playing the first track
      // If turning shuffle OFF, keep current track but update its connections
      if (newShuffleState) {
        const firstTrack = playlistQueue[0]
        if (firstTrack) {
          await setCurrentTrack(firstTrack)
          await setIsPlaying(true)
        }
      } else {
        // When turning shuffle OFF, update current track with new next/prev connections
        if (currentTrack) {
          const updatedCurrentTrack = playlistQueue.find(
            (track) => track.spotifyId === currentTrack.spotifyId
          )
          if (updatedCurrentTrack) {
            await setCurrentTrack(updatedCurrentTrack)
          }
        }
      }
    }
  }

  function isStationCurrentlyPlaying() {
    if (!currentTrack || !station || !station.tracks) return false
    return (
      currentStationId === station._id &&
      station.tracks.some(
        (track) => track.spotifyId === currentTrack.spotifyId
      )
    )
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

  async function onPause() {
    await setIsPlaying(false)
  }

  async function onResume() {
    await setIsPlaying(true)
  }

  function openModalEdit() {
    setIsModalEditOpen(true)
  }

  function closeModal() {
    setIsModalEditOpen(false)
  }

  async function onUpdateStation(station) {
    const stationToSave = { ...station }

    try {
      const savedStation = await updateStation(stationToSave)
      showSuccessMsg(`Station updated, new pin: ${savedStation.isPinned}`)
    } catch (err) {
      showErrorMsg('Cannot update station')
    }
  }

  if (!station) {
    return (
      <div className="station-details">
        <div className="loader-center">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <section className="station-details">
      <header className="details-header">
        
        <div className="station-img">
          {station.stationImgUrl ? (
            <img
              className="avg-img"
              src={station.stationImgUrl}
              alt="Station Image"
            />
          ) : (
            <SvgIcon iconName="musicNote" className="default-music-icon" />
          )}
        </div>
        <div className="station-info">
          <span>{station.stationType}</span>
          <h1
            {...(station.tags[0] !== 'Liked Songs' && {
              onClick: () => openModalEdit(),
            })}
          >
            {station.title}
          </h1>
          <div className="creator-info">
            <img src={station.createdBy.imgUrl} alt="Profile Image" />
            <span className="creator-name">{station.createdBy.fullname}</span>
            <span className="tracks-count">{station.tracks.length} tracks</span>
          </div>
        </div>
           <div className="background-track-list"></div>
      </header>

   

      <div className="station-btns-container">
        <div className="action-btns">
          {isStationCurrentlyPlaying() && isPlaying ? (
            <button onClick={onPause} className="play-btn">
              <SvgIcon iconName="pause" className="pause" />
            </button>
          ) : (
            <button
              onClick={() => {
                // If there's a current track from this station that's paused, just resume
                if (currentTrack && isStationCurrentlyPlaying() && !isPlaying) {
                  onResume()
                } else {
                  // Otherwise start playing from first track
                  onPlay(station.tracks[0])
                }
              }}
              className="play-btn"
              disabled={!station.tracks || station.tracks.length === 0}
            >
              <SvgIcon iconName="play" className="play" />
            </button>
          )}
          <button
            className={`shuffle-btn ${isShuffle ? 'active' : ''}`}
            onClick={() => onShuffle()}
          >
            <SvgIcon iconName="shuffle" />
          </button>
        </div>
      </div>

      <TrackList tracks={station.tracks} onPlay={onPlay} onPause={onPause} />

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

      {isModalEditOpen && (
        <ModalEdit
          station={station}
          isModalEditOpen={isModalEditOpen}
          closeModal={closeModal}
          updateStation={onUpdateStation}
        ></ModalEdit>
      )}
    </section>
  )
}
