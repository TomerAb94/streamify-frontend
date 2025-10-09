import React from 'react'
import { Routes, Route } from 'react-router'
import { useSelector } from 'react-redux'
import ReactPlayer from 'react-player'

import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { HomePage } from './cmps/HomePage.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationFilter } from './cmps/StationFilter.jsx'
import { TrackPreview } from './cmps/TrackPreview.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'
import { Browse } from './cmps/Browse.jsx'

export function RootCmp() {
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)

  function getPlayingTrack(){
    if (!playlist || !playlist.length) return false
 const playingTrack = playlist.find(track => track.isPlaying)
 return playingTrack
}

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
          src={`https://www.youtube.com/watch?v=${getPlayingTrack() ? getPlayingTrack().youtubeId : ''}`}
          playing={getPlayingTrack() ? true : false}
          controls={false} // Hide native controls
        />
      </div>
    </>
  )
}

