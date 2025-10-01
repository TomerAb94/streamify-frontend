import { useState } from 'react'

import { SvgIcon } from './SvgIcon'

export function ModalEdit({ station, isModalOpen, closeModal, updateStation }) {
  const [stationToEdit, setStationToEdit] = useState(station)

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
            placeholder='Add an optional description'
            value={stationToEdit.description}
          />

          <div className='station-img'>
            <img src={stationToEdit.stationImgUrl} alt="Station Cover" />
          </div>

          <button className="save-button" type="submit">
            Save
          </button>

          <p className="disclaimer">
            By proceeding, you agree to give Streamify access to the image you
            choose to upload. Please make sure you have the right to upload the
            image.
          </p>
        </form>
      </section>
    </>
  )
}
// 'album-image title'
//       'album-image description'
//       '. save-button'
//       'disclaimer disclaimer'
