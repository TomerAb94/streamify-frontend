# Streamify React Frontend

Modern React application built with Vite, featuring a complete frontend infrastructure for teaching full-stack development.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```md
# Streamify — Spotify clone (React + Vite frontend)

Live demo (hosted backend): https://streamify-xf48.onrender.com/

This repository contains the frontend for Streamify — a Spotify-like music app built with React, Vite and Redux. The app supports searching tracks/artists, playlists (albums), stations, playback via YouTube (ReactPlayer), user authentication flows, real-time chat/socket pieces, and a small PWA setup.

Backend note: the backend for this app (an Express + MongoDB server) is not included in this repository. The live demo above uses a hosted backend. To run the full stack locally you must clone or create the backend (Express + MongoDB), run it locally, and configure the frontend to point to your backend instance.

## 🚀 Quick start

1. Install dependencies
```powershell
npm install
```

2. Run the dev server

On Windows (this project sets a VITE_LOCAL flag in the dev script):
```powershell
npm run dev
```

On macOS / Linux (or if you prefer the plain vite dev script):
```bash
npm run dev:remote
```

3. Build for production
```powershell
npm run build
```

4. Preview the production build
```powershell
npm run preview
```

Notes
- The project defines a couple of dev scripts that toggle a VITE_LOCAL env var (useful for running against local vs remote backends). See `package.json` for exact scripts.

## 🧭 What you'll find here

Top-level structure (important folders/files):

```
src/
├── assets/              # Fonts, colors, global CSS
├── cmps/                # Reusable components (AppHeader, AppFooter, Player controls, etc.)
├── pages/               # Route pages (TrackDetails, ArtistDetails, Login/Signup, etc.)
├── services/            # API services (track, station, user, youtube, upload, socket, util)
├── store/               # Redux store, actions & reducers (trackModule, userModule, stationModule, reviewModule, system)
├── RootCmp.jsx          # App routes + player wiring (ReactPlayer)
├── index.jsx            # App entry (Provider, Router)
serviceWorkerRegistration.js # PWA registration
vite.config.js
package.json
```

## 🔌 Key features & components

- Playback: uses `react-player` to play tracks via YouTube links; global player state is kept in Redux.
- Routing: `react-router-dom` for nested routes (browse, album/playlist, track/artist pages, auth flows).
- State: Redux manages tracks, playlist, playback state (isPlaying, currentTrack, seekToSec, volume), users, reviews and system flags.
- Auth: `LoginSignup.jsx` implements login/signup routes and components.
- Search & Browse: `SearchTracks`, `SearchArtists`, `Browse`, `GenreList`, `StationSearch` and related components.
- Stations & Playlists: `StationIndex`, `StationDetails`, `PlayList`, `TrackList`, `TrackPreview`.
- Services: `spotify.service` (placeholders), `youtube.service` (YouTube integration), `upload.service`, `socket.service`, `http.service`, `async-storage.service`, and local/remote variants for tracks/stations/reviews/users.
- PWA: service worker registration is included and enabled by default in `index.jsx`.

## State & store modules

- `trackModule` — playback, current track, playlist, volume, progress
- `stationModule` — stations / playlists
- `userModule` — auth, logged-in user
- `reviewModule` — reviews for tracks/stations
- `systemModule` — UI flags, messages

Example (reading state & dispatching actions):
```jsx
import { useSelector, useDispatch } from 'react-redux'
const currentTrack = useSelector(state => state.trackModule.currentTrack)
const dispatch = useDispatch()
dispatch(setIsPlaying(true))
```

## Scripts (from package.json)

- `dev` - start development server (Windows variant sets VITE_LOCAL)
- `dev:remote` - start vite dev server without the local env flag
- `build` - build production assets
- `preview` - serve the production build locally
- `lint` - run ESLint

Check `package.json` for exact commands and OS-specific variants.

## Styling

- Plain CSS files live under `src/assets/styles/` and smaller component-specific CSS under `src/assets/styles/cmps/`.
- The app uses CSS Grid and Flexbox and contains utility classes and a theming approach via JS-managed genre colors (`src/assets/genreColors/genreColors.js`).

## Environment & config

- VITE_LOCAL: when set, the app can be configured to target local mocked services. See `package.json` dev scripts.
- Vite is used as the build/dev tool (`vite` & `@vitejs/plugin-react-swc`).

## Development notes

- The global audio/video player is implemented in `RootCmp.jsx` using `ReactPlayer` and wired to Redux (progress, seek, ended behavior, repeat).
- Many services have both local and remote implementations under `src/services/*/` (for tests, demo, or when a backend is not available).
- The app registers a service worker in `index.jsx` via `serviceWorkerRegistration.register()` to enable offline support and PWA features.

## Contributing

- Follow existing code patterns for components (JSX + module CSS in `assets/styles/cmps`).
- Add tests/linting rules when changing public behavior. Lint with `npm run lint`.

## Troubleshooting

- If you see CORS or API errors, verify whether you should run the backend or switch dev scripts (`dev` vs `dev:remote`).
- If playback isn't working, check the network and the `currentTrack.youtubeId` field in Redux.

## License

MIT

---
Streamify frontend — derived from a coding academy project and adapted into a Spotify-like demo app.
```


