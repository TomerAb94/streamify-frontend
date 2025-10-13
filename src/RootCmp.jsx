import React from 'react'
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
        </Route>

        <Route path="auth" element={<LoginSignup />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>

      <div className="youtube-video">
        <ReactPlayer
          src={`https://www.youtube.com/watch?v=${
            currentTrack?.youtubeId || ''
          }`}
          playing={isPlaying}
          volume={volume}
          controls={false} // Hide native controls
        />
      </div>
    </>
  )
}
