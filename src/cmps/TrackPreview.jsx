import { NavLink } from 'react-router-dom'
import { SvgIcon } from './SvgIcon'

export function TrackPreview({ track, isPlaying }) {
  console.log(track);
  
  return (
    <section className="track-preview">
      <div className="track-img">
        <img src={track.album?.imgUrl||track.album?.imgUrls[0]} alt={`${track.name} cover`} />
        <SvgIcon iconName={isPlaying ? 'pause' : 'play'} />
      </div>

      <div className="track-info">
        <span className="track-name">{track.name}</span>
        <div className="artist-name">
          {track.artists.map((artist, i) => (
            <NavLink onClick={(ev) => (ev.stopPropagation())} key={artist.id} to={`/artist/${artist.id?.[0]}`}>
              <span className="nav-link">
                {artist.name}
                {i < track.artists.length - 1 ? ', ' : ''}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  )
}
