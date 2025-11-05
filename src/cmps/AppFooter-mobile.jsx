import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'
import { FastAverageColor } from 'fast-average-color'
import { NavLink } from 'react-router-dom'

export function AppFooterMobile() {
  const currentTrack = useSelector((storeState) => storeState.trackModule.currentTrack)
  const isPlaying = useSelector((storeState) => storeState.trackModule.isPlaying)

  useEffect(() => {
    const fac = new FastAverageColor()
    const imgElement = document.querySelector(`.now-playing-mobile-img`)
    const background = document.querySelector('.now-playing-mobile')
    if (imgElement && background) {
      imgElement.crossOrigin = 'Anonymous'
      fac
        .getColorAsync(imgElement, { algorithm: 'dominant' })
        .then((color) => {
           const [r, g, b] = color.value
          const darkerColor = `rgba(${r * 0.4}, ${g * 0.4}, ${b * 0.4}, 1)`
          background.style.backgroundColor = darkerColor
        })
        .catch((e) => {
          console.log(e)
        })
    }
  }, [currentTrack?.spotifyId])

  return (
    <div className="app-footer-mobile">
      {currentTrack && (
        <div className="now-playing-mobile">
          <img className="now-playing-mobile-img" src={`${currentTrack?.album.imgUrl || currentTrack?.album.imgUrls[0]}`} alt="" />
          <div className="now-playing-mobile-info">
            <div className="now-playing-mobile-title">{currentTrack?.name}</div>
            <div className="now-playing-mobile-artist">{currentTrack?.artists[0].name}</div>
          </div>
        </div>
      )}

      <NavLink to="/" className="mobile-nav-item">
        <SvgIcon iconName="home" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className="mobile-nav-item">
        <SvgIcon iconName="search" />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className="mobile-nav-item">
        <SvgIcon iconName="defaultList" />
        <span>Your Library</span>
      </NavLink>
    </div>
  )
}
