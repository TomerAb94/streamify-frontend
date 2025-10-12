export function TrackPreview({ track, }) {
  return (
    <section className="track-preview">
      <div className="track-img">
        <img src={track.album?.imgUrl} alt={`${track.name} cover`} />
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
