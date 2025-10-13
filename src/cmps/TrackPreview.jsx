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
        <span className="artist-name">
          {track.artists.map((artist) => artist.name).join(', ')}
        </span>
      </div>
    </section>
  )
}
