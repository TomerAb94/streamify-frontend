import React from 'react'
import { Routes, Route } from 'react-router'

import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { HomePage } from './cmps/HomePage.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationFilter } from './cmps/StationFilter.jsx'
import { TrackPreview } from './cmps/TrackPreview.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'

export function RootCmp() {
  return (
    <>
      <UserMsg />
        <Routes>
          <Route element={<StationIndex />}>
            <Route path="" element={<HomePage />} />
            <Route path="/search" element={<StationFilter />} />
            <Route path="/station/:stationId" element={<StationDetails />} />
            <Route path="/track/:Id" element={<TrackPreview />} />
          </Route>

          <Route path="auth" element={<LoginSignup />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
    </>
  )
}
