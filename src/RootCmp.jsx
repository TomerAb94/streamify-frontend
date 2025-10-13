import React, { useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router'
import { useSelector } from 'react-redux'
import ReactPlayer from 'react-player'

import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { HomePage } from './cmps/HomePage.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationFilter } from './cmps/StationFilter.jsx'
import { TrackDetails } from './pages/TrackDetails.jsx'
import { ArtistDetails } from './pages/ArtistDetails.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'
import { Browse } from './cmps/Browse.jsx'
import { GenreList } from './cmps/GenreList.jsx'
import { PlayList } from './cmps/PlayList.jsx'

import { setProgressSec, setSeekToSec } from './store/actions/track.actions.js'

export function RootCmp() {
  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )

  const volume = useSelector(
    (storeState) => storeState.trackModule.volume
  )

  const seekToSec = useSelector((storeState) => storeState.trackModule.seekToSec)

  // A ref to the ReactPlayer instance, required for seekTo() on player
  const playerRef = useRef(null)

  // Sync the player's progress (seconds played) - from player → to Redux
  const handleTimeUpdate = useCallback(() => {
    const time = playerRef.current?.currentTime
    if (typeof time === 'number') setProgressSec(time)
  }, [])

  // Listen for "seekToSec" intent in Redux - from UI → to player
  useEffect(() => {
    if (seekToSec === null) return
    if (playerRef.current) playerRef.current.currentTime = seekToSec
    setSeekToSec(null)
  }, [seekToSec])

  return (
    <>
      <UserMsg />
      <Routes>
        <Route element={<StationIndex />}>
          <Route path="" element={<HomePage />} />
          <Route path="/search" element={<Browse />} />
          <Route path="/search/:searchStr" element={<StationFilter />} />
          <Route path="/station/:stationId" element={<StationDetails />} />
          <Route path="/track/:Id" element={<TrackDetails />} />
          <Route path="/artist/:Id" element={<ArtistDetails />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/browse/genre/:genreName"  element={<GenreList />} />
          <Route path="/browse/genre/:genreName/:playlistId"  element={<PlayList />} />
        </Route>

        <Route path="auth" element={<LoginSignup />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>

      <div className="youtube-video">
        <ReactPlayer
          ref={playerRef}
          src={`https://www.youtube.com/watch?v=${
            currentTrack?.youtubeId || ''
          }`}
          playing={isPlaying}
          volume={volume}
          controls={false} // Hide native controls
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
    </>
  )
}
