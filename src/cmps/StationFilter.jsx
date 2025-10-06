import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { spotifyService } from '../services/spotify.service'
import ReactPlayer from 'react-player'
import { youtubeService } from '../services/youtube.service'

export function StationFilter() {
  const params = useParams()
  const [tracks, setTracks] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackId, setTrackId] = useState(null);
//   const currentVideo = playlist[currentIndex];

  useEffect(() => {
    if (params.searchStr || params.searchStr !== '') {
      loadTracks()
    }
  }, [params.searchStr])

  async function loadTracks() {
    try {
      const res = await spotifyService.searchTracks(params.searchStr)
      setTracks(res.tracks.items)
    } catch (err) {
      console.error('Error loading tracks:', err)
    }
  }
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (trackId < playlist.length - 1) {
      setTrackId(trackId + 1);
      setIsPlaying(false); // Pause on switch
    }
  };

  const handlePrev = () => {
    if (trackId > 0) {
      setTrackId(trackId - 1);
      setIsPlaying(false); // Pause on switch
    }
  };

  const handleEnded = () => {
    handleNext(); // Auto-advance to next video
  };
async function onPlay(trackName) {
    console.log(trackName)
   const youtubeId = await getYoutubeId(trackName)
   console.log('youtubeId:', youtubeId)
   setTrackId(youtubeId)
   console.log('trackId:', trackId)
   setIsPlaying(true)

  }
//   var song = spotifyService.getArtist('1HY2Jd0NmPuamShAr6KMms').then((res) => console.log(res))

  var res = youtubeService.getVideos('adelle - Someone Like You').then((res) => console.log('youtube:', res[0]))

async function getYoutubeId(str) {
  try {
    const res = await youtubeService.getVideos(str)
//    console.log(res[0].id)
    if (!res || !res.length) return null
    return res[0].id
  } catch (err) {
    console.error('Error fetching YouTube URL:', err)
    return null
  }
}

//   var test = getYoutubeUrl('die')
//   console.log(test)


  console.log('tracks:', tracks)

  if (!tracks || tracks.length === 0) return <div>loading...</div>

  return (
    <section className="station-filter">
      <h1>Station-Filter</h1>
<div className='youtube-video'> 
              <ReactPlayer
         src={`https://www.youtube.com/watch?v=${trackId}`}
        playing={isPlaying}
        controls={false} // Hide native controls
        // width="100%"
        // height="auto"
        // style={{ aspectRatio: '16/9' }}
        onEnded={handleEnded}
      />
</div>

<ul>
      {tracks.map((track) => (
        
        <li key={track.id}>
          {track.name}
          {track.artists.map((artist) => (
            <li key={artist.id}>{artist.name}</li>
          ))}
       <button onClick={()=>onPlay(track.name)}>Play</button>
        <button onClick={()=>handlePlayPause()}>Pause</button>
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
