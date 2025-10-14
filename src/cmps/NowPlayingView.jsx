import { SvgIcon } from './SvgIcon'

export function NowPlayingView({
    currentTrack,
    isPlaying,
    onPlay,
    onPause,
    isOpen,
    onClose,
}) {
    
    if (!currentTrack) return null

    const handleMain = () => (isPlaying ? onPause() : onPlay(currentTrack))

    return (
        <div className={`side-panel now-playing ${isOpen ? 'open' : ''}`}>
            <header className="panel-header">
                <h1>Now Playing</h1>
                <button onClick={onClose}>
                    <SvgIcon iconName="close" />
                </button>
            </header>

            <div className="panel-body np-body">
                <div className="np-art">
                    {currentTrack.album?.imgUrl ||
                    currentTrack.album?.imgUrls?.[0] ? (
                        <img
                            src={
                                currentTrack.album.imgUrl ||
                                currentTrack.album.imgUrls[0]
                            }
                            alt={`${currentTrack.name} cover`}
                        />
                    ) : (
                        <div className="art-placeholder" />
                    )}
                </div>

                <div className="np-meta">
                    <h2>{currentTrack.name}</h2>
                    <p>{currentTrack.artists?.map((a) => a.name).join(', ')}</p>

                    <div className="np-controls">
                        <button
                            onClick={handleMain}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            <SvgIcon iconName={isPlaying ? 'pause' : 'play'} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
