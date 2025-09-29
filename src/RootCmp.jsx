import React from 'react'
import { Routes, Route } from 'react-router'

import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'
import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationList } from './cmps/StationList.jsx'
import { StationPreview } from './cmps/StationPreview.jsx'
import { StationFilter } from './cmps/StationFilter.jsx'
import { TrackPreview } from './cmps/TrackPreview.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'

export function RootCmp() {
  return (
    <>
      <UserMsg />
        <Routes>
          <Route element={<StationIndex />}>
            <Route path="" element={<StationDetails />} />
            <Route path="/search" element={<StationFilter />} />
            <Route path="/station/:Id" element={<StationPreview />} />
            <Route path="/track/:Id" element={<TrackPreview />} />
          </Route>
          {/* <TrackPreview /> */}

          <Route path="auth" element={<LoginSignup />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
        </Routes>
    </>
  )
}
