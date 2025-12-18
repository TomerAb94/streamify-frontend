import { useEffect, useState, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { logout } from '../store/actions/user.actions'
import { SvgIcon } from './SvgIcon'
import { debounce, useDebounce } from '../services/util.service'

export function AppHeader() {
  const user = useSelector((storeState) => storeState.userModule.user)
  const [searchBy, setSearchBy] = useState('')
  const [homeBtn, setHomeBtn] = useState(true)
  const [browseBtn, setBrowseBtn] = useState(false)
  const prevSearchRef = useRef('')
  const navigate = useNavigate()
  const location = useLocation()

  const debouncedSearch = useDebounce((txt) => setSearchBy(txt), 300)

  useEffect(() => {
    if (searchBy.length > 0) {
      navigate(`/search/${searchBy}`)
      prevSearchRef.current = searchBy
    } else if (searchBy.length === 0 && prevSearchRef.current.length > 0) {
      // User cleared the search - navigate to /search
      navigate(`/search`)
      setBrowseBtn(true)
      setHomeBtn(false)
      prevSearchRef.current = ''
    }
  }, [searchBy])

  // window.filterBy = filterBy

  function handleInput({ target }) {
    const txt = target.value
    debouncedSearch(txt)
  }

  function backToHome() {
    navigate('/')
  }

  function backToBrowse() {
    navigate('/search')
  }

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
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            {/* <!-- Background circle with outline --> */}
            <circle
              cx="256"
              cy="256"
              r="240"
              fill="#1DB954"

              // stroke="black" stroke-width="20"
            />

            {/* <!-- 8 uneven, messy bars --> */}
            <rect x="60" y="260" width="25" height="110" rx="10" fill="black" />
            <rect x="90" y="210" width="25" height="160" rx="10" fill="black" />
            <rect x="120" y="285" width="25" height="85" rx="10" fill="black" />
            <rect x="150" y="180" width="25" height="190" rx="10" fill="black" />
            <rect x="180" y="140" width="25" height="230" rx="10" fill="black" />
            <rect x="210" y="245" width="25" height="125" rx="10" fill="black" />
            <rect x="240" y="190" width="25" height="180" rx="10" fill="black" />
            <rect x="270" y="270" width="25" height="100" rx="10" fill="black" />
            <rect x="300" y="245" width="25" height="125" rx="10" fill="black" />
            <rect x="332" y="190" width="25" height="180" rx="10" fill="black" />
            <rect x="365" y="270" width="25" height="100" rx="10" fill="black" />
            <rect x="395" y="245" width="25" height="125" rx="10" fill="black" />
            <rect x="425" y="270" width="25" height="100" rx="10" fill="black" />
          </svg>
        </NavLink>
      </div>

      <div className="search-bar">
        <button
          className="home-btn-container"
          title="Home"
          onClick={() => {
            onToggleHomeBtn()
            backToHome()
          }}
        >
          {!homeBtn || location.pathname !== '/' ? (
            <SvgIcon iconName="home" className="home-btn" />
          ) : (
            <SvgIcon iconName="homeBold" className="home-bold-svg" />
          )}
        </button>

        <div className="search-wrapper">
          <span>
            {' '}
            <SvgIcon iconName="magnifyingGlass" />
          </span>
          <input
            type="text"
            name="upper-search"
            id="upper-search"
            placeholder="What do you want to play?"
            onInput={(ev) => {
              handleInput(ev)
            }}
          />

          <span
            className="browse"
            onClick={() => {
              onToggleBrowseBtn()
              backToBrowse()
            }}
          >
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
            {/* <Link to={`user/${user._id}`}> */}
            {user.imgUrl && <img src={user.imgUrl} alt="user" onClick={onLogout} />}
            {/* {user.fullname} */}
            {/* </Link> */}
            {/* <button onClick={onLogout}>logout</button> */}
          </button>
        )}
      </div>
      <div className="stations-type">
        <button className="active">All</button>
        <button>Music</button>
        <button>Podcasts</button>
      </div>
      <div className="back-btn" onClick={() => navigate(-1)}>
        <SvgIcon iconName="back" />
      </div>
    </div>
  )
}
