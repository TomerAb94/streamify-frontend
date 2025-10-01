
export function Modal({ children, isOpen, onClose = () => { } }) {
console.log('hi');

    if (!isOpen) return null
    return (
        <>
            <section onClick={onClose} className='modal-backdrop'></section>
            <section  className='modal-content'>
              <h1>hi</h1>
                {children}
                <button className='close-btn' onClick={onClose}>X</button>
            </section>
        </>
    )
}

