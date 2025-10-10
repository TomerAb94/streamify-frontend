import { useState } from 'react'

export function TrackPreview({ track, idx, isPlaying }) {
  const [hoveredTrackIdx, setHoveredTrackIdx] = useState(null)

  function handleMouseEnter(idx) {
    setHoveredTrackIdx(idx)
  }

  function handleMouseLeave() {
    setHoveredTrackIdx(null)
  }
  return (
    <section
      className="track-preview"
      onMouseEnter={() => handleMouseEnter(idx)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="track-img">
        <img src={track.album?.imgUrl} alt={`${track.name} cover`} />
      </div>

      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <span className="artist-name">{track.artists.map(artist => artist.name).join(', ')}</span>
      </div>
    </section>
  )
}

//   <div className="track-num">
//     {getPlayingTrack().isPlaying &&
//     getPlayingTrack().spotifyId === track.spotifyId ? (
//       <div className="track-num">
//         {getPlayingTrack().isPlaying &&
//         getPlayingTrack().spotifyId === track.spotifyId ? (
//           hoveredTrackIdx === idx ? (
//             <SvgIcon
//               iconName="pause"
//               className="pause"
//               onClick={() => onPause(getPlayingTrack())}
//             />
//           ) : (
//             <SvgIcon iconName="equalizer" className="equalizer" />
//           )
//         ) : hoveredTrackIdx === idx ? (
//           <SvgIcon
//             iconName="play"
//             className="play"
//             onClick={() => onPlay(track)}
//           />
//         ) : (
//           idx + 1
//         )}
//       </div>
//     ) : hoveredTrackIdx === idx ? (
//       <SvgIcon iconName="play" className="play" onClick={() => onPlay(track)} />
//     ) : (
//       idx + 1
//     )}
//   </div>

//   <div className="track-title">
//     {track.album?.imgUrl && (
//       <img
//         src={track.album.imgUrl}
//         alt={`${track.name} cover`}
//         className="track-img"
//       />
//     )}
//     <div className="track-text">
//       <span className="track-name">{track.name}</span>
//       <div className="track-artists">
//         {track.artists.map((artist, i) => (
//           <span key={artist.id}>
//             {artist.name}
//             {i < track.artists.length - 1 ? ', ' : ''}
//           </span>
//         ))}
//       </div>
//     </div>
//   </div>

//   <div className="track-album">{track.album?.name}</div>
//   <div className="track-duration-container">
//     <span className="track-duration">{formatDuration(track.duration)}</span>
//   </div>
// </div>
