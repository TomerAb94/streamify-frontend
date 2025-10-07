import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'

import { addTrack, removeTrack } from '../store/actions/track.actions'
import { trackService } from '../services/track'

export function StationFilter() {
  const params = useParams()
  const [searchedTracks, setSearchedTracks] = useState([])

  const [trackToPlay, setTrackToPlay] = useState(null)

  useEffect(() => {
    if (params.searchStr || params.searchStr !== '') {
      loadSearchedTracks()
    }
  }, [params.searchStr])

  async function loadSearchedTracks() {
    try {
      const res = await spotifyService.searchTracks(params.searchStr)

      setSearchedTracks(res.tracks.items)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }

  // const handlePlayPause = () => {
  //   setIsPlaying(!isPlaying)
  // }

  // const handleNext = () => {
  //   if (trackId < playlist.length - 1) {
  //     setTrackId(trackId + 1)
  //     setIsPlaying(false) // Pause on switch
  //   }
  // }

  // const handlePrev = () => {
  //   if (trackId > 0) {
  //     setTrackId(trackId - 1)
  //     setIsPlaying(false) // Pause on switch
  //   }
  // }

  // const handleEnded = () => {
  //   handleNext() // Auto-advance to next video
  // }

  async function onPlay(track) {
    // Remove currently playing track if exists
    if (trackToPlay) {
      await removeTrack(trackToPlay._id)
    }
    // Create track object from Spotify track data
    const trackToSave = {
      name: track.name,
      imgUrl: track.album?.images?.[0]?.url || null,
      artists: track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      duration_ms: track.duration_ms,
      isPlaying: true,
    }

    // Get YouTube ID and add it to track
    const youtubeId = await getYoutubeId(track.name)
    trackToSave.youtubeId = youtubeId
    
    // Save track and set as currently playing
    const savedTrack = await addTrack(trackToSave)
    setTrackToPlay(savedTrack)
  }

  async function getYoutubeId(str) {
    try {
      const res = await youtubeService.getVideos(str)
      if (!res || !res.length) return null
      return res[0].id
    } catch (err) {
      console.error('Error fetching YouTube URL:', err)
      return null
    }
  }

  function formatDuration(durationMs) {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!searchedTracks || searchedTracks.length === 0)
    return <div>loading...</div>

  return (
    <section className="station-filter ">
      <ul>
        {searchedTracks.map((track) => (
          <li className="track-preview" key={track.id}>
            <h3 className="track-name">{track.name}</h3>

            <div className="track-artists">
              {track.artists.map((artist) => (
                <div key={artist.id}>{artist.name}</div>
              ))}
            </div>
            {track.album?.images?.[0]?.url && (
              <img
                src={track.album.images[0].url}
                alt={`${track.name} cover`}
                width="100"
              />
            )}
            <div className="track-duration">
              {formatDuration(track.duration_ms)}
            </div>

            <div>
              <button onClick={() => onPlay(track)}>Play</button>
              {/* <button onClick={() => handlePlayPause()}>Pause</button> */}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
//     <div>
//       <h3>Current Video: {currentIndex + 1} of {playlist.length}</h3>

//       <div style={{ marginTop: '10px' }}>
//         <button onClick={handlePrev} disabled={currentIndex === 0}>
//           Previous
//         </button>
//         <button onClick={handlePlayPause} style={{ margin: '0 10px' }}>
//           {playing ? 'Pause' : 'Play'}
//         </button>
//         <button onClick={handleNext} disabled={currentIndex === playlist.length - 1}>
//           Next
//         </button>
//       </div>
//       {/* Optional: List of thumbnails/titles for selection */}
//       <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
//         {playlist.map((url, index) => (
//           <li key={index}>
//             <button
//               onClick={() => {
//                 setCurrentIndex(index);
//                 setPlaying(false);
//               }}
//               style={{
//                 width: '100%',
//                 marginBottom: '5px',
//                 background: index === currentIndex ? '#e0e0e0' : 'transparent'
//               }}
//             >
//               Video {index + 1}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
