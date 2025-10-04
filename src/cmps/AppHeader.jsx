import { styled } from '@mui/material/styles'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { logout } from '../store/actions/user.actions'
import { useState } from 'react'
import { SvgIcon } from './SvgIcon'
export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.user)
  const [homeBtn, setHomeBtn] = useState(false)
  const [browseBtn, setBrowseBtn] = useState(false)


 

  // const Search = styled('div')(({ theme }) => ({
  //   position: 'relative',
  //   borderRadius: '9999px',
  //   backgroundColor: '#1f1f1f',
  //   '&:hover': {
  //     backgroundColor: '#2a2a2a',
  //   },
  //   marginLeft: 0,
  //   width: '100%',
  //   [theme.breakpoints.up('sm')]: {
  //     marginLeft: theme.spacing(1),
  //     width: '480px',
  //   },
  // }))

  // const SearchIconWrapper = styled('div')(({ theme }) => ({
  //   padding: theme.spacing(0, 2),
  //   height: '100%',
  //   position: 'absolute',
  //   pointerEvents: 'none',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   color: '#d1d1d1',
  //   scale: '1.1',
  // }))

  // const StyledInputBase = styled(InputBase)(({ theme }) => ({
  //   color: '#fff',
  //   width: '480px',
  //   height: '48px',
  //   padding: '12px 96px 12px 48px',
  //   borderRadius: '9999px',
  //   transition: 'box-shadow 0.2s ease',

  //   '&.Mui-focused': {
  //     boxShadow: 'inset 0 0 0 2px #fff',
  //     cursor: 'unset',
  //   },

  //   '& .MuiInputBase-input': {
  //     padding: theme.spacing(1, 1, 1, 0),
  //     width: '100%',
  //   },
  // }))

  async function onLogout() {
    try {
      await logout()
      navigate('/')
      showSuccessMsg(`Bye now`)
    } catch (err) {
      showErrorMsg('Cannot logout')
    }
  }

  function onToggleHomeBtn() {
    setHomeBtn(true)
    setBrowseBtn(false)
  }

  function onToggleBrowseBtn() {
    setBrowseBtn(true)
    setHomeBtn(false)
  }

  return (
    <div className="app-header">
      <div className="logo" title="Streamify" onClick={onToggleHomeBtn}>
        <NavLink to="/">
          <svg xmlns="http://www.w3.org/2000/svg" height="52" width="52" viewBox="-33.4974 -55.829 290.3108 334.974">
            <path
              d="M177.707 98.987c-35.992-21.375-95.36-23.34-129.719-12.912-5.519 1.674-11.353-1.44-13.024-6.958-1.672-5.521 1.439-11.352 6.96-13.029 39.443-11.972 105.008-9.66 146.443 14.936 4.964 2.947 6.59 9.356 3.649 14.31-2.944 4.963-9.359 6.6-14.31 3.653m-1.178 31.658c-2.525 4.098-7.883 5.383-11.975 2.867-30.005-18.444-75.762-23.788-111.262-13.012-4.603 1.39-9.466-1.204-10.864-5.8a8.717 8.717 0 015.805-10.856c40.553-12.307 90.968-6.347 125.432 14.833 4.092 2.52 5.38 7.88 2.864 11.968m-13.663 30.404a6.954 6.954 0 01-9.569 2.316c-26.22-16.025-59.223-19.644-98.09-10.766a6.955 6.955 0 01-8.331-5.232 6.95 6.95 0 015.233-8.334c42.533-9.722 79.017-5.538 108.448 12.446a6.96 6.96 0 012.31 9.57M111.656 0C49.992 0 0 49.99 0 111.656c0 61.672 49.992 111.66 111.657 111.66 61.668 0 111.659-49.988 111.659-111.66C223.316 49.991 173.326 0 111.657 0"
              fill="#1ed660"
            />
          </svg>
        </NavLink>
      </div>

    <div className="search-bar">
  <button className="home-btn-container" title="Home" onClick={onToggleHomeBtn}>
    {!homeBtn ? (
      <SvgIcon iconName="home" className="home-btn" />
    ) : (
      <SvgIcon iconName="homeBold" className="home-bold-svg" />
    )}
  </button>

  <div className="search-wrapper">
    <input
      type="text"
      name="upper-search"
      id="upper-search"
      placeholder="What do you want to play?"
    />
    <span className="browse" onClick={onToggleBrowseBtn}>
      {!browseBtn ? (
        <SvgIcon iconName="browse" className="browse-btn" />
      ) : (
        <SvgIcon iconName="browseBold" className="browse-btn browse-btn-bold" />
      )}
    </span>
  </div>
</div>

      <div className="user-profile">
        {!user && (
          <>
            <NavLink to="auth/signup" className="signup-link">
              Sign Up
            </NavLink>
            <NavLink to="auth/login" className="login-link">
              Log In
            </NavLink>
          </>
        )}

        {user && (
          <button className="user-info">
            <Link to={`user/${user._id}`}>
              {user.imgUrl && <img src={user.imgUrl} alt="user" />}
              {/* {user.fullname} */}
            </Link>
            {/* <button onClick={onLogout}>logout</button> */}
          </button>
        )}
      </div>
    </div>
  )
}
