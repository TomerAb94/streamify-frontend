import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { spotifyService } from '../services/spotify.service'

export function TrackDetails() {
  const params = useParams()
  const [track, setTrack] = useState(null)

  useEffect(() => {
    if (params.Id && params.Id !== '') {
      loadTrack(params.Id)
    }
  }, [params.Id])

  async function loadTrack(trackId) {
    const track = await spotifyService.getFullTrackData(trackId)
    setTrack(track)
    console.log(track)
  }

  return (
    <section className="track-details">
      <header className="track-details-header">
        <div className="img-container">
          <img
            width={'60px'}
            src={track?.album?.imgUrls[0]}
            alt={track?.name}
          />
        </div>
        <div className="track-details-info">
          <p>Song</p>
          <h1>{track?.name}</h1>
          <div className="more-info">
            <span className="artist-img">
              <img
                width={'60px'}
                src={track?.artist.imgUrls[0]}
                alt={track?.artist?.name}
              />
            </span>
            <span className="artist-name">{track?.artist?.name}</span>
            <span className="album-name">{track?.album?.name}</span>
            <span className="release-date">{track?.releaseDate}</span>
            <span className="followers">{track?.followers} followers</span>
          </div>
        </div>
      </header>
      <div className="action-btns">
        {/* {(isStationCurrentlyPlaying() && isPlaying) ? ( */}
        <button
          //   onClick={onPause}
          className="play-btn"
        >
          {/* <SvgIcon iconName="pause" className="pause" /> */}
        </button>
        {/* ) : ( */}
        <button
          //   onClick={() => {
          // If there's a current track from this station that's paused, just resume
          // if (currentTrack && isStationCurrentlyPlaying() && !isPlaying) {
          //   onResume()
          // } else {
          // Otherwise start playing from first track
          //   onPlay(station.tracks[0])
          // }
          //   }}
          className="play-btn"
          //   disabled={!station.tracks || station.tracks.length === 0}
        >
          {/* <SvgIcon iconName="play" className="play" /> */}
        </button>
        {/* )} */}
        {/* <SvgIcon iconName="shuffle" /> */}
      </div>

      <div className="lyrics">
        <p>{track?.lyrics}</p>
      </div>
      <div className="artist-data">
        <span className="artist-img">
          <img
            width={'60px'}
            src={track?.artist.imgUrls[0]}
            alt={track?.artist?.name}
          />
        </span>
        <div className="artist-mini-data">
          <p>Artist</p>
          <span className="artist-name">{track?.artist?.name}</span>
        </div>

        <div className="album-tracks">
          <div className="album-tracks-header">
            <p>From this album</p>
            <h3>{track?.album?.name}</h3>
            {track?.album?.tracks.map((track, idx) => (
              <div key={track.id} className="album-track-row">
                <span className="track-num">{idx + 1}</span>
                <span className="track-name">{track.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
