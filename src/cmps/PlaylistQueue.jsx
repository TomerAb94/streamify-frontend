import { SvgIcon } from './SvgIcon'
import { TrackPreview } from './TrackPreview'

export function PlaylistQueue({
  playlist,
  currentTrack,
  onToggleQueue,
  isQueueOpen,
  station,
}) {
  
  // Sort playlist by following nextId chain starting from currentTrack
  function getSortedNextTracks() {
    if (!currentTrack || !playlist.length) return []
    
    const sortedTracks = []
    const seenTrackIds = new Set([currentTrack.spotifyId]) // Track current track to avoid duplicates
    let nextTrackId = currentTrack.nextId
    
    // Follow the nextId chain
    while (nextTrackId && sortedTracks.length < playlist.length) {
      const nextTrack = playlist.find(track => track.spotifyId === nextTrackId)
      
      // If track found and not already processed
      if (nextTrack && !seenTrackIds.has(nextTrack.spotifyId)) {
        sortedTracks.push(nextTrack)
        seenTrackIds.add(nextTrack.spotifyId)
        nextTrackId = nextTrack.nextId
      } else {
        break // Chain broken or circular reference
      }
    }
    
    // Add any remaining tracks that weren't in the nextId chain (fallback)
    playlist.forEach(track => {
      if (!seenTrackIds.has(track.spotifyId)) {
        sortedTracks.push(track)
        seenTrackIds.add(track.spotifyId)
      }
    })
    
    return sortedTracks
  }
  return (
    <div className={`queue ${isQueueOpen ? 'open' : ''}`}>
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
            <div className="playing">
              <TrackPreview track={currentTrack} />
            </div>
          </div>
        )}

        {getSortedNextTracks().length > 0 && (
          <div className="track-area">
            <h2>Next from: {station?.title || 'Playlist'}</h2>
            {getSortedNextTracks().map((track) => (
              <div key={track.spotifyId}>
                <TrackPreview track={track} />
              </div>
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
