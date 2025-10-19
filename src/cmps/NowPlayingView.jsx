import { useEffect, useState } from 'react'

import { SvgIcon } from './SvgIcon'
import { spotifyService } from '../services/spotify.service'
import { useSelector } from 'react-redux'
import { updateStation } from '../store/actions/station.actions'

export function NowPlayingView({
   currentTrack,
   isOpen,
}) {

    const stations = useSelector((station) => station.stationModule.stations)
    if (!currentTrack) return null

    const likedStation = stations.find((station) => station.title === 'Liked Songs')
    const isLiked = likedStation
        ? likedStation.tracks?.some(track => track.spotifyId === currentTrack.spotifyId)
        : false

    async function toggleLike() {
        if (!likedStation) return

        const exists = likedStation.tracks?.some(track => track.spotifyId === currentTrack.spotifyId)

        const { youtubeId, isPlaying, ...cleanTrack } = currentTrack

        const nextTracks = exists
            ? likedStation.tracks.filter(track => track.spotifyId !== currentTrack.spotifyId)
            : [...likedStation.tracks, cleanTrack]

        await updateStation({ ...likedStation, tracks: nextTracks })
    }

    return (
        <aside className={`now-playing ${isOpen ? 'open' : ''}`}>
            <header className="np-header">
                <h1 className="np-heading" title={currentTrack.name}>
                    {currentTrack.name}
                </h1>

            </header>

            <div className="np-scroll">
                <div>
                    <div className="np-art">
                        {currentTrack.album?.imgUrl || currentTrack.album?.imgUrls?.[0] ? (
                            <img
                                src={currentTrack.album.imgUrl || currentTrack.album.imgUrls[0]}
                                alt={`${currentTrack.name} cover`}
                            />
                        ) : (
                            <div className="art-placeholder" />
                        )}
                    </div>
                    <div className="np-meta">
                        <div className="np-meta-left">
                            <h2 className="np-title">{currentTrack.name}</h2>
                            <p className="np-artists">
                                {currentTrack.artists?.map((artist) => artist.name).join(', ')}
                            </p>
                        </div>

                        <button
                            className="np-like"
                            onClick={toggleLike}
                            aria-pressed={isLiked}
                            title={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                        >
                            <SvgIcon iconName={isLiked ? 'inStation' : 'addLikedSong'} />
                        </button> 
                    </div>
                </div>
                <div>About artist</div>
                <div>Credits</div>
                <div>Next in queue</div>
            </div>
        </aside>
    )
}
