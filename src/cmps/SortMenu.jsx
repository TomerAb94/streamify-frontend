import { useState } from 'react'
import { SvgIcon } from './SvgIcon'

export function SortMenu({ setFilterBy }) {
  const sortTypes = ['Recently Added', 'Alphabetical']
  const [selectedSort, setSelectedSort] = useState('Recently Added')

  function handleClick(ev, type) {
    ev.preventDefault()
    setSelectedSort(type)
    setFilterBy((prev) => ({ ...prev, sortBy: type }))
  }

  return (
    <div className="sort-and-view-picker">
      <ul className="sort-menu">
        <span className="sort-label">Sort by</span>
        {sortTypes.map((type) => (
          <li key={type}>
            <button
              onClick={(ev) => handleClick(ev, type)}
              className={`sort-type-btn ${
                selectedSort === type ? 'clicked' : ''
              }`}
            >
              <span>{type}</span>
              <SvgIcon iconName="checked" className="checked-icon" />
            </button>
          </li>
        ))}
      </ul>
      {/* <div className="view-picker">*/}
    </div>
  )
}
