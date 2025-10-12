import { SvgIcon } from './SvgIcon'
import { TrackPreview } from './TrackPreview'

export function PlaylistQueue({
  playlist,
  currentTrack,
  onToggleQueue,
  queueRef,
  station,
}) {
  return (
    <div ref={queueRef} className="queue">
      <header>
        <h1>Queue</h1>
        <button onClick={onToggleQueue}>
          <SvgIcon iconName="close" />
        </button>
      </header>
      <div className="queue-track-list">
        {currentTrack && (
          <div className="track-area">
            <h2>Now playing</h2>
            <TrackPreview
              key={`current-${currentTrack.spotifyId}`}
              track={currentTrack}
              idx={0}
            />
          </div>
        )}

        {playlist.length > 0 && (
          <div className="track-area">
            <h2>Next from: {station.title}</h2>
            {playlist.map((track, idx) => (
              <TrackPreview
                key={`queue-${track.spotifyId}-${idx}`}
                track={track}
                idx={idx + 1}
              />
            ))}
          </div>
        )}

        {!currentTrack && playlist.length === 0 && (
          <div className="empty-queue">
            <p>No tracks in queue</p>
          </div>
        )}
      </div>
    </div>
  )
}
