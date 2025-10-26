import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { SvgIcon } from './SvgIcon'
import { updateStation } from '../store/actions/station.actions'
import { spotifyService } from '../services/spotify.service'

export function NowPlayingView({ currentTrack, isOpen }) {
    const stations = useSelector((station) => station.stationModule.stations)

    const [artistImg, setArtistImg] = useState(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    
    const scrollRef = useRef(null)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const onScroll = () => setScrolled(el.scrollTop > 0)
        onScroll()
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    const hasTrack = !!currentTrack

    const mainArtist = currentTrack?.artists?.[0].name || 'Unknown Artist'

    const likedStation = stations.find(
        (station) => station.title === 'Liked Songs'
    )
    const likedTracks = likedStation?.tracks ?? []

    const isLiked = hasTrack
        ? likedTracks.some(
              (track) => track.spotifyId === currentTrack.spotifyId
          )
        : false

    const artSrc = hasTrack
        ? currentTrack?.album?.imgUrl ||
          currentTrack?.album?.imgUrls?.[0] ||
          null
        : null

    function getFirstArtistId(track) {
        const a0 = track?.artists?.[0]
        if (!a0) return null
        return Array.isArray(a0.id) ? a0.id[0] : a0.id || null
    }

    useEffect(() => {
        let ignore = false
        async function loadArtistImg() {
            if (!hasTrack) {
                setArtistImg(null)
                return
            }

            try {
                const artistId = getFirstArtistId(currentTrack)
                if (!artistId) {
                    setArtistImg(null)
                    return
                }
                const artist = await spotifyService.getSpotifyItems('artist',artistId)
                if (!ignore) {
                    setArtistImg(artist?.images?.[0]?.url || null)
                }
            } catch (err) {
                if (!ignore) setArtistImg(null)
                console.error('Failed to load artist image', err)
            }
        }
        loadArtistImg()
        return () => {
            ignore = true
        }
    }, [hasTrack, currentTrack])

    async function toggleLike() {
        if (!hasTrack || !likedStation) return

        const exists = likedTracks?.some(
            (track) => track.spotifyId === currentTrack.spotifyId
        )

        const { youtubeId, isPlaying, ...cleanTrack } = currentTrack

        const nextTracks = exists
            ? likedTracks.filter(
                  (track) => track.spotifyId !== currentTrack.spotifyId
              )
            : [...likedTracks, cleanTrack]

        await updateStation({ ...likedStation, tracks: nextTracks })
    }

    return (
        <aside className={`now-playing ${isOpen ? 'open' : ''} ${scrolled ? 'scrolled' : ''}`}>
            <header className="np-header">
                <h1
                    className="np-heading"
                    title={
                        hasTrack ? currentTrack.name : 'No song playing yet...'
                    }
                >
                    {hasTrack ? currentTrack.name : 'No song playing yet...'}
                </h1>
            </header>

            <div className="np-scroll" ref={scrollRef}>
                {hasTrack ? (
                    <>
                        <div>
                            <div className="np-art">
                                {artSrc ? (
                                    <img
                                        src={artSrc}
                                        alt={`${currentTrack.name} cover`}
                                    />
                                ) : (
                                    <div className="art-placeholder" />
                                )}
                            </div>

                            <div className="np-meta">
                                <div className="np-meta-left">
                                    <h2 className="np-title">
                                        {currentTrack.name}
                                    </h2>
                                    <p className="np-artists">
                                        {currentTrack.artists
                                            ?.map((a) => a.name)
                                            .join(', ')}
                                    </p>
                                </div>

                                <button
                                    className="np-like"
                                    onClick={toggleLike}
                                    aria-pressed={isLiked}
                                    title={
                                        isLiked
                                            ? 'Remove from Liked Songs'
                                            : 'Add to Liked Songs'
                                    }
                                >
                                    <SvgIcon
                                        iconName={
                                            isLiked
                                                ? 'inStation'
                                                : 'addLikedSong'
                                        }
                                    />
                                </button>
                            </div>
                        </div>

                        <section className="np-artist-section">
                            <article className="np-artist-card">
                                <figure className="np-artist-art">
                                    <div
                                        className="np-artist-hero"
                                        style={{
                                            // 2 layers: gradient on top, image under
                                            backgroundImage: `linear-gradient(rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 50%), url(${
                                                artistImg || artSrc || ''
                                            })`,
                                        }}
                                        aria-label={
                                            currentTrack?.artists?.[0]?.name ||
                                            'Artist'
                                        }
                                        role="img"
                                    />
                                    <figcaption className="np-artist-label">
                                        About the artist
                                    </figcaption>
                                </figure>

                                <div className="np-artist-info">
                                    <h4 className="np-artist-name">
                                        {currentTrack?.artists?.[0]?.name ||
                                            'Unknown Artist'}
                                    </h4>

                                    <div className="np-artist-row">
                                        <p className="np-artist-metric">
                                            {new Intl.NumberFormat().format(
                                                1500000 +
                                                    (Math.abs(
                                                        (
                                                            currentTrack
                                                                ?.artists?.[0]
                                                                ?.name || ''
                                                        ).length * 4242
                                                    ) %
                                                        85000000)
                                            )}
                                            <span>monthly listeners</span>
                                        </p>

                                        <button
                                            className={`np-artist-follow ${
                                                isFollowing ? 'following' : ''
                                            }`}
                                            onClick={() =>
                                                setIsFollowing((p) => !p)
                                            }
                                        >
                                            {isFollowing
                                                ? 'Unfollow'
                                                : 'Follow'}
                                        </button>
                                    </div>

                                    <p className="np-artist-desc">
                                        {currentTrack?.artists?.[0]?.name ||
                                            'This artist'}{' '}
                                        is known for a distinctive sound that
                                        blends emotional depth with modern
                                        production. Their music connects with
                                        listeners across genres, delivering both
                                        energy and authenticity.
                                    </p>
                                </div>
                            </article>
                        </section>

                        <section className="np-credits-section">
                            <article className="np-credits-card">
                                <header className="np-credits-header">
                                    <h3 className="np-credits-title">
                                        Credits
                                    </h3>
                                    <button
                                        className="np-credits-showall"
                                        onClick={() =>
                                            console.log(
                                                'Show all credits clicked'
                                            )
                                        }
                                    >
                                        Show all
                                    </button>
                                </header>

                                <ul className="np-credits-list">
                                    <li className="np-credits-row">
                                        <div className="np-credits-left">
                                            <div className="np-credits-name">
                                                {mainArtist}
                                            </div>
                                            <div className="np-credits-roles">
                                                Main Artist
                                            </div>
                                        </div>

                                        <button
                                            className={`np-credits-follow ${
                                                isFollowing ? 'following' : ''
                                            }`}
                                            onClick={() =>
                                                setIsFollowing((prev) => !prev)
                                            }
                                        >
                                            {isFollowing
                                                ? 'Unfollow'
                                                : 'Follow'}
                                        </button>
                                    </li>

                                    <li className="np-credits-row">
                                        <div className="np-credits-left">
                                            <div className="np-credits-name">
                                                {mainArtist}
                                            </div>
                                            <div className="np-credits-roles">
                                                Composer
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </article>
                        </section>

                        <section className="np-section">
                            <h3 className="np-section-title">Next in queue</h3>
                            {/* … */}
                        </section>
                    </>
                ) : (
                    <section className="np-empty">
                        <p>Choose a song and hit play.</p>
                        <span className="hint">
                            Or{' '}
                            <NavLink to="/search" className="np-browse-link">
                                browse
                            </NavLink>{' '}
                            to discover more.
                        </span>
                    </section>
                )}
            </div>
        </aside>
    )
}
