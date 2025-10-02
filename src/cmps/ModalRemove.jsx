import { SvgIcon } from './SvgIcon'

export function ModalRemove({
  station,
  isModalRemoveOpen,
  closeModal,
  onConfirmRemove,
}) {
  if (!isModalRemoveOpen) return null

  function handleConfirm() {
    onConfirmRemove(station._id)
    closeModal()
  }

  return (
    <>
      <section onClick={closeModal} className="modal-backdrop"></section>
      <section className="modal-content-remove">
        <h2>Delete from Your Library?</h2>

        <p>
          This will delete <span>{station.title}</span> from{' '}
          <span>Your Library.</span>
        </p>

        <div className="modal-actions-remove">
          <button onClick={closeModal} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleConfirm} className="confirm-button">
            Delete
          </button>
        </div>
      </section>
    </>
  )
}
