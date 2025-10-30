

import { SvgIcon } from './SvgIcon'
import { NavLink } from 'react-router-dom'

export function AppFooterMobile(){
    return (
        <div className="app-footer-mobile">
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