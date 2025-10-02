import { SvgIcon } from './SvgIcon'

export function StationListActions({
  activeStationId,
  stations,
  actionPosition,
  onAddStation,
  onRemoveStation,
  onUpdateStation,
  onOpenModalEdit,
  onClose,
}) {
  function handletogglePin(station) {
    station.isPinned = !station.isPinned
    onUpdateStation(station)
    onClose()
  }

  function handleRemoveStation(stationId) {
    onRemoveStation(stationId)
    onClose()
  }

  function handleOpenModalEdit() {
    onOpenModalEdit()
    onClose()
  }

  if (!activeStationId) return null
  const station = stations.find((s) => s._id === activeStationId)

  return (
    <div
      className="action-menu-container"
      style={{
        position: 'fixed',
        left: `${actionPosition.x}px`,
        top: `${actionPosition.y}px`,
        zIndex: 1000,
      }}
    >
      <ul className="action-menu">
        {!station.tags.includes('Liked Songs') && (
          <>
            <li>
              <button
                className="action-btn no-background"
                onClick={handleOpenModalEdit}
              >
                <SvgIcon iconName="edit" /> <span>Edit details</span>
              </button>
            </li>

            <li>
              <button
                className="action-btn no-background"
                onClick={() => handleRemoveStation(activeStationId)}
              >
                <SvgIcon iconName="delete" /> <span>Delete</span>
              </button>
            </li>

            <div className="spacer"></div>

            <li>
              <button
                className="action-btn no-background"
                onClick={() => onAddStation()}
              >
                <SvgIcon iconName="musicNotePlus" /> <span>Create playlist</span>
              </button>
            </li>
          </>
        )}
        <li>
          <button
            className="action-btn no-background"
            onClick={() => {
              handletogglePin(station)
            }}
          >
            {station.isPinned ? (
              <>
                <SvgIcon iconName="pin" />
                <span>Unpin playlist</span>
              </>
            ) : (
              <>
                <SvgIcon iconName="pinNoFill" />
                <span>Pin playlist</span>
              </>
            )}
          </button>
        </li>
      </ul>
    </div>
  )
}
