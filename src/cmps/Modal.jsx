import { useState } from 'react'

import { SvgIcon } from './SvgIcon'

export function Modal({ station, isModalOpen, closeModal, updateStation }) {
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
          <input onInput={handleChange}
            type="text"
            name="title"
            id="title"
            value={stationToEdit.title}
          />
          <button
            className="save-button"
            type="submit"
          >
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
