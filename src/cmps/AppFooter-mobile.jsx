import { useState } from 'react'
import { useSelector } from 'react-redux'
import { SvgIcon } from './SvgIcon'

import { NavLink } from 'react-router-dom'




export function AppFooterMobile(){

  const currentTrack = useSelector(
    (storeState) => storeState.trackModule.currentTrack
  )
  const isPlaying = useSelector(
    (storeState) => storeState.trackModule.isPlaying
  )
    return (
        
        <div className="app-footer-mobile">
            <div className='now-playing-mobile'>
              <div className='now-playing-mobile-img'><img src={`${currentTrack?.album.imgUrl}`} alt="" /></div>
                <div className='now-playing-mobile-info'>
                    <div className='now-playing-mobile-title'>{currentTrack?.name}</div>
                    <div className='now-playing-mobile-artist'>{currentTrack?.artists[0].name}</div>
                </div>
            </div>
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