import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { spotifyService } from '../services/spotify.service'
import { youtubeService } from '../services/youtube.service'
import { SvgIcon } from '../cmps/SvgIcon'

import {
  setCurrentTrack,
  setIsPlaying,
  setTracks,
} from '../store/actions/track.actions'

export function ArtistDetails() {
  const params = useParams()
  const [artist, setArtist] = useState(null)

  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

  useEffect(() => {
    if (params.Id && params.Id !== '') {
      loadArtist(params.Id)
    }
  }, [params.Id])

  async function loadArtist(artistId) {
    const artist = await spotifyService.getArtistData(artistId)
    setArtist(artist)
    console.log(artist)
  }

  return (
    <section className="artist-details">
      <header className="artist-details-header">
        <div className="img-header-container">
          <img src={artist?.imgUrls?.[0]} alt={artist?.name} />

          <div className="artist-details-info">
            <span className='verified-artist'>
              <SvgIcon iconName="verified" />
              <span> Verified Artist</span>
            </span>
            <h1>{artist?.name}</h1>

            <span className="followers">
              {artist?.followers?.toLocaleString()} monthly listeners
            </span>
          </div>
        </div>
      </header>
      {/* <div className="action-btns">
            {currentTrack?.spotifyId === track?.spotifyId && isPlaying ? (
              <button onClick={onPause} className="play-btn">
                <SvgIcon iconName="pause" className="pause" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onPlay(track)
                }}
                className="play-btn"
              >
                <SvgIcon iconName="play" className="play" />
              </button>
            )} */}
      {/* <SvgIcon iconName="shuffle" /> */}
      {/* </div> */}

      {/* <div className="lyrics-artist-container">
            <div className="lyrics">
              <h2>Lyrics</h2>
              <LongText txt={track?.lyrics} />
            </div>
            <NavLink
              className={'artist-link'}
              to={`/artist/${track?.artists?.[0]?.id?.[0]}`}
            >
              <div className="artist-data">
                <span className="artist-img">
                  <img
                    width={'60px'}
                    src={track?.artists[0]?.imgUrls[0]}
                    alt={track?.artists[0]?.name}
                  />
                </span>
                <div className="artist-mini-data">
                  <p>Artist</p>
                  <span className="artist-name nav-link">
                    {track?.artists[0]?.name}
                  </span>
                </div>
              </div>
            </NavLink>
          </div> */}

      {/* <div className="album-tracks">
            <TrackList
                    tracks={track?.album?.tracks}
                    onPlay={onPlay}
                    onPause={onPause}
                  />
          </div> */}
    </section>
  )
}
