import { useSelector } from 'react-redux'

export function AppFooter() {

    return (
        <footer className="app-footer full">
            
            <div className="player-left">
                <div className="cover" aria-hidden="true">Cover</div>
                <div className="mini-track">
                    <div className="title">Track title</div>
                    <div className="artist">Artist name</div>
                </div>
                <div className="btn-like">
                    <button className="btn-mini-liked" aria-checked="false" aria-label="Add to Liked Songs">
                        +
                    </button>
                </div>
            </div>

            <div className="player-center">
                <div className="transport">
                    <button aria-label="Shuffle">Shuffle</button>
                    <button aria-label="Previous">Previous</button>
                    <button aria-label="Play">Play</button>
                    <button aria-label="Next">Next</button>
                    <button aria-label="Repeat">Repeat</button>
                </div>
                <div className="track-timeline">
                    <span className="time">0:00</span>
                    <input type="range" min="0" max="100" defaultValue="0" aria-label="Seek" />
                    <span className="time">3:45</span>
                </div>
            </div>

            <div className="player-right">
                <div className="volume">
                    Volume
                    <input type="range" min="0" max="100" defaultValue="80" aria-label="Volume" />
                </div>
            </div>
            
        </footer>
    )
}
