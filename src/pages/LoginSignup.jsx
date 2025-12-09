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

  const navigate = useNavigate()

  // useEffect(() => {
  //   loadUsers()
  //   console.log('users:', users)
  // }, [])

  // async function loadUsers() {

  //   const users = await userService.getUsers()
  //   setUsers(users)
  // }

  async function onLogin(ev = null) {
    // console.log('ev:', ev)
    ev.preventDefault()
    ev.stopPropagation()

    if (!credentials.username || !credentials.password) return

    try {
      const user = await login(credentials)
      console.log('user:', user)
      if (user) {
        navigate('/')
      }
    } catch (err) {
      console.error('Login failed:', err)
      // כאן אפשר להוסיף הודעת שגיאה למשתמש
    }
  }

  function handleChange(ev) {
    const field = ev.target.name
    const value = ev.target.value
    setCredentials({ ...credentials, [field]: value })
  }

  return (
    <form className="login-form" onSubmit={onLogin}>
      <input name="username" type='text' placeholder="Username" value={credentials.username} onChange={handleChange} required/>

      <input
        name="password"
        placeholder="Password"
        type="password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      <button>Login</button>
    </form>
  )
}

export function Signup() {
  const [credentials, setCredentials] = useState(userService.getEmptyUser())
  const navigate = useNavigate()

  function clearState() {
    setCredentials({ username: '', password: '', fullname: '', imgUrl: '' })
  }

  function handleChange(ev) {
    const type = ev.target.type

    const field = ev.target.name
    const value = ev.target.value
    setCredentials({ ...credentials, [field]: value })
  }

  async function onSignup(ev = null) {
    if (ev) ev.preventDefault()

    if (!credentials.username || !credentials.password || !credentials.fullname) return

    const defaultStation = stationService.getDefaultStation(credentials)

    try {
      const user = await signup(credentials)
      const savedStation = await addStation(defaultStation)
      user.ownedStationIds.push(savedStation._id)
      const savedUser = await updateUser(user)
    } catch (err) {
      console.log('err:', err)
    }
    clearState()
    navigate('/')
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
      <ImgUploader onUploaded={onUploaded} />
      <button>Signup</button>
    </form>
  )
}
