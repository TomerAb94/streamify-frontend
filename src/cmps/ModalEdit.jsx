import { useState } from 'react'

import { SvgIcon } from './SvgIcon'

export function ModalEdit({ station, isModalOpen, closeModal, updateStation }) {
  const [stationToEdit, setStationToEdit] = useState(station)
  const [isImgHovered, setIsImgHovered] = useState(false)
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)

  function handleChange(ev) {
    const field = ev.target.name
    const value = ev.target.value

    setStationToEdit({ ...stationToEdit, [field]: value })
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    updateStation(stationToEdit)
    closeModal()
  }

  function handleFileChange(ev) {
    const file = ev.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setStationToEdit({ ...stationToEdit, stationImgUrl: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  function handleImageClick() {
    document.getElementById('imageUpload').click()
  }

  function handleImageClickFromMenu(ev) {
    ev.preventDefault()
    ev.stopPropagation()
    document.getElementById('imageUpload').click()
    setIsActionMenuOpen(false)
  }

  function handleRemovePhoto() {
    setStationToEdit({ ...stationToEdit, stationImgUrl: '' })
    setIsActionMenuOpen(false)
  }

  function toggleActionMenu(ev) {
    ev.preventDefault()
    ev.stopPropagation()

    setIsActionMenuOpen(!isActionMenuOpen)
  }

  if (!isModalOpen) return null
  return (
    <>
      <section onClick={closeModal} className="modal-backdrop"></section>
      <section className="modal-content">
        <div className="modal-header">
          <h1>Edit details</h1>
          <div onClick={closeModal}>
            <SvgIcon iconName="close" />
          </div>
        </div>

        <form className="edit-station-form" onSubmit={handleSubmit}>
          <input
            className="title"
            onInput={handleChange}
            type="text"
            name="title"
            id="title"
            value={stationToEdit.title}
          />

          <textarea
            className="description"
            onInput={handleChange}
            type="text"
            name="description"
            id="description"
            placeholder="Add an optional description"
            value={stationToEdit.description}
          />

          <div
            className="station-img"
            onMouseEnter={() => setIsImgHovered(true)}
            onMouseLeave={() => setIsImgHovered(false)}
            onClick={handleImageClick}
          >
            <>
              {stationToEdit.stationImgUrl ? (
                <img src={stationToEdit.stationImgUrl} alt="Station Cover" />
              ) : (
                <SvgIcon
                  className="modal-svg"
                  iconName={isImgHovered ? 'edit' : 'musicNote'}
                />
              )}
              {isImgHovered && (
                <button
                  onClick={(ev) => toggleActionMenu(ev)}
                  className="dots-btn"
                >
                  <SvgIcon iconName="dots" />
                </button>
              )}
            </>
            {isImgHovered && <SvgIcon className="modal-svg" iconName="edit" />}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="imageUpload"
            />
          </div>

          <button className="save-button" type="submit">
            Save
          </button>

          <p className="disclaimer">
            By proceeding, you agree to give Streamify access to the image you
            choose to upload. Please make sure you have the right to upload the
            image.
          </p>

          {isActionMenuOpen && (
            <div className="action-menu">
              <button onClick={handleImageClickFromMenu} className="action-btn no-background">
                <SvgIcon iconName="photo" />
                Change photo
              </button>
              <button onClick={handleRemovePhoto} className="action-btn no-background">
                <SvgIcon iconName="trash" />
                Remove photo
              </button>
            </div>
          )}
        </form>
      </section>
    </>
  )
}
