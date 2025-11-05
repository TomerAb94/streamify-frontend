import React, { useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router'
import { useSelector } from 'react-redux'
import ReactPlayer from 'react-player'

import { UserMsg } from './cmps/UserMsg.jsx'

import { StationIndex } from './pages/StationIndex.jsx'
import { HomePage } from './cmps/HomePage.jsx'
import { StationDetails } from './cmps/StationDetails.jsx'
import { StationSearch } from './cmps/StationSearch.jsx'
import { SearchTracks } from './cmps/SearchTracks.jsx'
import { SearchArtists } from './cmps/SearchArtists.jsx'
import { TrackDetails } from './pages/TrackDetails.jsx'
import { ArtistDetails } from './pages/ArtistDetails.jsx'

import { LoginSignup, Login, Signup } from './pages/LoginSignup.jsx'
import { Browse } from './cmps/Browse.jsx'
import { GenreList } from './cmps/GenreList.jsx'
import { PlayList } from './cmps/PlayList.jsx'

import { setProgressSec, setSeekToSec, setCurrentTrack, setIsPlaying } from './store/actions/track.actions.js'

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
  const playlist = useSelector((storeState) => storeState.trackModule.tracks)
  const isRepeat = useSelector(
    (storeState) => storeState.trackModule.isRepeat
  )

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

  // Handler for when track ends - repeat current track if repeat is on, otherwise play next track
  const handleEnded = useCallback(() => {
    if (!currentTrack) return

    if (isRepeat) {
      // If repeat is enabled, restart the current track from the beginning
      setSeekToSec(0) // Use Redux action to seek to beginning
      setIsPlaying(true) // Restart playback
    } else if (currentTrack.nextId && playlist.length) {
      // Otherwise, play the next track
      const nextTrack = playlist.find(track => track.spotifyId === currentTrack.nextId)
      if (nextTrack) {
        setCurrentTrack(nextTrack)
        setIsPlaying(true)
      }
    }
  }, [currentTrack, playlist, isRepeat])

  return (
    <>
      <UserMsg />
      <Routes>
        <Route element={<StationIndex />}>
          <Route path="" element={<HomePage />} />
          <Route path="/album/:albumId"  element={<PlayList/>} />
          <Route path="/search" element={<Browse />} />
          <Route path="/search/:searchStr" element={<StationSearch />} />
          <Route path="/search/tracks/:searchStr" element={<SearchTracks />} />
          <Route path="/search/artists/:searchStr" element={<SearchArtists />} />
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
          // volume={volume}
          volume={0.02}
          controls={false} // Hide native controls
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>
    </>
  )
}
