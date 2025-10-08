import { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import ReactPlayer from 'react-player'

import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { HomePage } from './cmps/HomePage.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationFilter } from './cmps/StationFilter.jsx'
import { TrackPreview } from './cmps/TrackPreview.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'
import { Browse } from './cmps/Browse.jsx'

import { setDurationSec, setProgressPct, setSeekToSec } from './store/actions/track.actions.js'

export function RootCmp() {
  const dispatch = useDispatch()
  const { currentTrack, isPlaying, volume, seekToSec } = useSelector((state) => state.trackModule)
  const playerRef = useRef(null)

  useEffect(() => {
    if (seekToSec === null) return
    const el = playerRef.current
    console.log('el useEffect', el)
    
    if (el && typeof el.currentTime === 'number') {
      el.currentTime = seekToSec
    }
    dispatch(setSeekToSec(null))
  }, [seekToSec, dispatch])

  return (
    <>
      <UserMsg />
      <Routes>
        <Route element={<StationIndex />}>
          <Route path="" element={<HomePage />} />
          <Route path="/search" element={<Browse />} />
          <Route path="/search/:searchStr" element={<StationFilter />} />
          <Route path="/station/:stationId" element={<StationDetails />} />
          <Route path="/track/:Id" element={<TrackPreview />} />
          <Route path="/browse" element={<Browse />} />
        </Route>

        <Route path="auth" element={<LoginSignup />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>

      <div className="youtube-video">
        <ReactPlayer
          ref={playerRef}
          src={currentTrack?.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : null}
          playing={isPlaying}
          volume={volume ?? 0.8}
          controls={false} // Hide native controls
          width={0}
          height={0}
          onTimeUpdate={(ev) => {
            const el = ev?.target
            const dur = Number(el?.duration) || 0
            const cur = Number(el?.currentTime) || 0
            const pct = dur > 0 ? (cur / dur) * 100 : 0
            
            dispatch(setDurationSec(dur))
            dispatch(setProgressPct(pct))
          }}
          onDurationChange={(ev) => {
            const el = ev?.target            
            const dur = Number(el?.duration) || 0
            
            dispatch(setDurationSec(dur))
          }}
        />
      </div>
    </>
  )
}