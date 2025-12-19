import { Outlet, useNavigate } from 'react-router'
import { NavLink } from 'react-router-dom'

import { useState, useEffect } from 'react'

import { userService } from '../services/user'
import { login, signup, updateUser } from '../store/actions/user.actions'
import { ImgUploader } from '../cmps/ImgUploader'

import { stationService } from '../services/station'
import { addStation } from '../store/actions/station.actions'

export function LoginSignup() {
  return (
    <div className="login-page">
      <nav>
        <NavLink to="login">Login</NavLink>
        <NavLink to="signup">Signup</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

export function Login() {
  const [users, setUsers] = useState([])
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    fullname: '',
  })

  const [isError, setIsError] = useState(false)

  const navigate = useNavigate()

  async function onLogin(ev = null) {
    // console.log('ev:', ev)
    ev.preventDefault()
    ev.stopPropagation()

    if (!credentials.username || !credentials.password) return

    try {
      const user = await login(credentials)
      // console.log('user:', user)
      if (user) {
        navigate('/')
      }
    } catch (err) {
      console.error('Login failed:', err)
      setIsError(true)
      console.log('Invalid username or password')
    }
  }

  function handleChange(ev) {
    const field = ev.target.name
    const value = ev.target.value
    setCredentials({ ...credentials, [field]: value })
    setIsError(false)
  }

  return (
    <form className="login-form" onSubmit={onLogin}>
      <input
        name="username"
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={handleChange}
        required
      />

      <input
        name="password"
        placeholder="Password"
        type="password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      {isError && (
        <div className="error-message" style={{ color: 'red' }}>
          Invalid username or password
        </div>
      )}
      <button>Login</button>
    </form>
  )
}

export function Signup() {
  const [credentials, setCredentials] = useState(userService.getEmptyUser())
  const navigate = useNavigate()
  const [isError, setIsError] = useState(false)

  function clearState() {
    setCredentials({ username: '', password: '', fullname: '', imgUrl: '' })
  }

  function handleChange(ev) {
    const type = ev.target.type

    const field = ev.target.name
    const value = ev.target.value
    setCredentials({ ...credentials, [field]: value })
    setIsError(false)
  }

  async function onSignup(ev = null) {
    if (ev) ev.preventDefault()
    if (!credentials.username || !credentials.password || !credentials.fullname) return
    const defaultStation = stationService.getDefaultStation(credentials)
    try {
      const user = await signup(credentials)
      const savedStation = await addStation(defaultStation)
      console.log('user:', user)
      console.log('user:', savedStation)

      // Initialize ownedStationIds if it doesn't exist
      if (!user.ownedStationIds) {
        user.ownedStationIds = []
      }
      user.ownedStationIds.push(savedStation._id)
      
      await updateUser(user)
      await login(credentials)
      navigate('/')

    } catch (err) {
      console.log('err:', err)
      setIsError(true)
      clearState()
    }
  }

  function onUploaded(imgUrl) {
    setCredentials({ ...credentials, imgUrl })
  }

  return (
    <form className="signup-form" onSubmit={onSignup}>
      <input
        type="text"
        name="fullname"
        value={credentials.fullname}
        placeholder="Fullname"
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="username"
        value={credentials.username}
        placeholder="Username"
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        value={credentials.password}
        placeholder="Password"
        onChange={handleChange}
        required
      />
      {isError && (
        <div className="error-message" style={{ color: 'red' }}>
          Username already taken. Please choose another one.
        </div>
      )}
      <ImgUploader onUploaded={onUploaded} />
      <button>Signup</button>
    </form>
  )
}
