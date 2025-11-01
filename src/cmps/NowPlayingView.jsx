import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'

import { SvgIcon } from './SvgIcon'
import { updateStation } from '../store/actions/station.actions'
import { spotifyService } from '../services/spotify.service'

export function NowPlayingView({ isOpen, onOpenQueue, onPlay }) {
    const navigate = useNavigate()

    const stations = useSelector(
        (storeState) => storeState.stationModule.stations
    )
    const currentTrack = useSelector(
        (storeState) => storeState.trackModule.currentTrack
    )
    const queue = useSelector((storeState) => storeState.trackModule.tracks)

    const [artistImg, setArtistImg] = useState(null)
    const [artistMeta, setArtistMeta] = useState(null)
    const [resolvedAlbumId, setResolvedAlbumId] = useState(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const scrollRef = useRef(null)

    const hasTrack = !!currentTrack

    const mainArtist = currentTrack?.artists?.[0].name || 'Unknown Artist'
    const mainArtistId =
        (Array.isArray(currentTrack?.artists?.[0]?.id)
            ? currentTrack?.artists?.[0]?.id?.[0]
            : currentTrack?.artists?.[0]?.id) || null

    const albumId = useMemo(
        () => getAlbumIdFromTrack(currentTrack),
        [currentTrack]
    )

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

    const nextTrack = useMemo(() => {
        if (!currentTrack || !Array.isArray(queue) || queue.length === 0)
            return null

        // 1) Next by explicit nextId
        if (currentTrack.nextId) {
            const byNextId = queue.find(
                (t) => t.spotifyId === currentTrack.nextId
            )
            if (byNextId) return byNextId
        }

        // 2) Next by position in queue
        const idx = queue.findIndex(
            (t) => t.spotifyId === currentTrack.spotifyId
        )
        if (idx > -1 && idx + 1 < queue.length) return queue[idx + 1]

        // 3) Fallback: any different track
        return queue.find((t) => t.spotifyId !== currentTrack.spotifyId) || null
    }, [currentTrack, queue])

    const monthlyListeners = useMemo(() => {
        if (artistMeta?.followers)
            return Math.floor(artistMeta.followers * 0.85)

        const name = currentTrack?.artists?.[0].name || ''
        return 1500000 + (Math.abs(name.length * 4242) % 850000)
    }, [artistMeta, currentTrack])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const onScroll = () => setScrolled(el.scrollTop > 0)
        onScroll()
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentTrack?.spotifyId])

    useEffect(() => setResolvedAlbumId(null), [currentTrack?.spotifyId])

    useEffect(() => {
        let ignore = false
        async function ensureAlbumId() {
            if (!currentTrack) return
            const hasId =
                currentTrack?.album?.spotifyId ||
                currentTrack?.spotifyAlbumId ||
                currentTrack?.album?.id ||
                resolvedAlbumId
            if (hasId) return

            try {
                const full = await spotifyService.getSpotifyItems(
                    'getFullTrackData',
                    currentTrack.spotifyId
                )
                const id = full?.album?.id || full?.album?.spotifyId || null
                if (!ignore && id) setResolvedAlbumId(id)
            } catch (err) {
                console.error('ensureAlbumId failed', err)
            }
        }
        ensureAlbumId()
        return () => {
            ignore = true
        }
    }, [currentTrack?.spotifyId, resolvedAlbumId])

    useEffect(() => {
        let ignore = false
        async function loadArtistImg() {
            if (!hasTrack) {
                setArtistImg(null)
                setArtistMeta(null)
                return
            }

            try {
                const artistId = getFirstArtistId(currentTrack)
                if (!artistId) {
                    setArtistImg(null)
                    setArtistMeta(null)
                    return
                }
                const artist = await spotifyService.getSpotifyItems(
                    'artist',
                    artistId
                )
                if (!ignore) {
                    setArtistImg(artist?.images?.[0]?.url || null)
                    setArtistMeta({
                        followers: artist?.followers?.total,
                    })
                }
            } catch (err) {
                if (!ignore) {
                    setArtistImg(null)
                    setArtistMeta(null)
                }
                console.error('Failed to load artist', err)
            }
        }
        loadArtistImg()
        return () => {
            ignore = true
        }
    }, [hasTrack, currentTrack])

    function getFirstArtistId(track) {
        const a0 = track?.artists?.[0]
        if (!a0) return null
        return Array.isArray(a0.id) ? a0.id[0] : a0.id || null
    }

    function getAlbumIdFromTrack(track) {
        if (!track) return null
        return (
            track?.album?.spotifyId ||
            track?.spotifyAlbumId ||
            track?.album?.id ||
            null
        )
    }

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

    async function handleGoAlbum() {
        try {
            let id = albumId || resolvedAlbumId
            if (!id && hasTrack) {
                // fetch full track to learn album.id
                const full = await spotifyService.getSpotifyItems(
                    'getFullTrackData',
                    currentTrack.spotifyId
                )
                id = full?.album?.id || full?.album?.spotifyId || null
                if (id) setResolvedAlbumId(id)
            }
            if (id) navigate(`/album/${id}`)
        } catch (err) {
            console.error('Failed to resolve album id', err)
        }
    }

    const canGo = Boolean(albumId || resolvedAlbumId)

    return (
        <aside
            className={`now-playing ${isOpen ? 'open' : ''} ${
                scrolled ? 'scrolled' : ''
            }`}
        >
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
                                    <button
                                        type="button"
                                        className="np-cover-btn"
                                        onClick={handleGoAlbum}
                                        aria-label="Open album"
                                    >
                                        <img
                                            src={artSrc}
                                            alt={`${currentTrack.name} cover`}
                                        />
                                    </button>
                                ) : (
                                    <div className="art-placeholder" />
                                )}
                            </div>

                            <div className="np-meta">
                                <div className="np-meta-left">
                                    {albumId || resolvedAlbumId ? (
                                        <button
                                            type="button"
                                            onClick={handleGoAlbum}
                                            className="np-title np-link-underline as-button"
                                            title={
                                                canGo
                                                    ? 'Open album'
                                                    : 'Resolving album…'
                                            }
                                            aria-disabled={!canGo}
                                            data-clickable={canGo}
                                        >
                                            {currentTrack.name}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleGoAlbum}
                                            className="np-title np-link-underline as-button"
                                            title="Open album"
                                        >
                                            {currentTrack.name}
                                        </button>
                                    )}
                                    <p className="np-artists">
                                        {currentTrack.artists?.map((a, idx) => {
                                            const aId = Array.isArray(a?.id)
                                                ? a.id[0]
                                                : a?.id
                                            const name =
                                                a?.name || 'Unknown Artist'
                                            const sep =
                                                idx <
                                                currentTrack.artists.length - 1
                                                    ? ', '
                                                    : ''
                                            return aId ? (
                                                <span key={aId}>
                                                    <NavLink
                                                        to={`/artist/${aId}`}
                                                        className="np-link-underline"
                                                    >
                                                        {name}
                                                    </NavLink>
                                                    {sep}
                                                </span>
                                            ) : (
                                                <span key={`${name}-${idx}`}>
                                                    {name}
                                                    {sep}
                                                </span>
                                            )
                                        })}
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
                            {mainArtistId ? (
                                <NavLink
                                    to={`/artist/${mainArtistId}`}
                                    className="np-artist-link"
                                >
                                    <article className="np-artist-card">
                                        <figure className="np-artist-art">
                                            <div
                                                className="np-artist-hero"
                                                style={{
                                                    backgroundImage: `linear-gradient(rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 50%), url(${
                                                        artistImg ||
                                                        artSrc ||
                                                        ''
                                                    })`,
                                                }}
                                                aria-label={
                                                    currentTrack?.artists?.[0]
                                                        ?.name || 'Artist'
                                                }
                                                role="img"
                                            />
                                            <figcaption className="np-artist-label">
                                                About the artist
                                            </figcaption>
                                        </figure>

                                        <div className="np-artist-info ">
                                            <h4 className="np-artist-name np-link-underline">
                                                {currentTrack?.artists?.[0]
                                                    ?.name || 'Unknown Artist'}
                                            </h4>

                                            <div className="np-artist-row">
                                                <p className="np-artist-metric">
                                                    <span>
                                                        {monthlyListeners?.toLocaleString()}{' '}
                                                        monthly listeners
                                                    </span>
                                                </p>

                                                <button
                                                    className={`np-artist-follow ${
                                                        isFollowing
                                                            ? 'following'
                                                            : ''
                                                    }`}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setIsFollowing(
                                                            (p) => !p
                                                        )
                                                    }}
                                                >
                                                    {isFollowing
                                                        ? 'Unfollow'
                                                        : 'Follow'}
                                                </button>
                                            </div>

                                            <p className="np-artist-desc">
                                                {currentTrack?.artists?.[0]
                                                    ?.name ||
                                                    'This artist'}{' '}
                                                is known for a distinctive sound
                                                that blends emotional depth with
                                                modern production. Their music
                                                connects with listeners across
                                                genres, delivering both energy
                                                and authenticity.
                                            </p>
                                        </div>
                                    </article>
                                </NavLink>
                            ) : (
                                <article className="np-artist-card">
                                    {/* fallback without link (rare) */}
                                </article>
                            )}
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
                                                {mainArtistId ? (
                                                    <NavLink
                                                        to={`/artist/${mainArtistId}`}
                                                        className="np-link-underline"
                                                    >
                                                        {mainArtist}
                                                    </NavLink>
                                                ) : (
                                                    mainArtist
                                                )}
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

                        <section className="np-next-card">
                            <div className="np-next-header">
                                <h3 className="np-next-title">Next in queue</h3>
                                <button
                                    className="np-open-queue"
                                    onClick={() => onOpenQueue?.()}
                                >
                                    Open queue
                                </button>
                            </div>

                            {nextTrack ? (
                                <div className="np-next-box-hover">
                                    <button
                                        className="np-next-row"
                                        onClick={() => onPlay?.(nextTrack)}
                                    >
                                        {nextTrack.album?.imgUrl && (
                                            <div className="np-next-art-wrap">
                                                <img
                                                    className="np-next-art"
                                                    src={nextTrack.album.imgUrl}
                                                    alt={`${nextTrack.name} cover`}
                                                />
                                                <span
                                                    className="np-next-overlay"
                                                    aria-hidden="true"
                                                >
                                                    <SvgIcon iconName="playHomePage" />
                                                </span>
                                            </div>
                                        )}
                                        <div className="np-next-text">
                                            <div className="np-next-name">
                                                {nextTrack.name}
                                            </div>
                                            <div className="np-next-sub">
                                                {nextTrack.artists
                                                    ?.map((a) => a.name)
                                                    .join(', ')}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <p className="np-next-empty">
                                    No more songs in queue
                                </p>
                            )}
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
