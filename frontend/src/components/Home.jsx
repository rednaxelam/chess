import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import initializeSocket from '../services/initializeSocket'
import { emitGetNewName } from '../services/socketEmitters'

const GuestAccountModal = ({ isDisplayed, closeModal }) => {
  const dialogRef = useRef(null)
  const abortControllerRef = useRef(null)
  const userState = useSelector(({ onlineUser }) => onlineUser)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isDisplayed) {
      abortControllerRef.current = new AbortController()
      initializeSocket(abortControllerRef.current.signal).catch(console.error)
      dialog.showModal()
    } else {
      dialog.close()
      if (!localStorage.getItem('token') && abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }

    return () => {
      if (!localStorage.getItem('token') && abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [isDisplayed])

  const handleBackgroundClick = (event) => {
    if (event.target === dialogRef.current) {
      closeModal()
    }
  }

  // the temporary styles are a quick fix for now to make sure that the dialog can't be closed when clicking inside of it
  const temporaryDialogStyle = { padding: '0px' }
  const temporaryPStyle = { marginTop: '0px' }

  if (userState) {
    return <dialog ref={dialogRef} onClick={handleBackgroundClick} style={temporaryDialogStyle}>
      <div>
        <p style={temporaryPStyle}>you will be playing as a...</p>
        <p>{userState.username}!</p>
        <button onClick={emitGetNewName}>change name</button>
        <button onClick={closeModal}>close</button>
      </div>
    </dialog>
  } else {
    return <dialog ref={dialogRef} onClick={handleBackgroundClick}  style={temporaryDialogStyle}>
      <div>
        <p style={temporaryPStyle}>creating guest account...</p>
        <button onClick={closeModal}>cancel</button>
      </div>
    </dialog>
  }
}

const PlayOnlineButton = ({ setIsModalOpen }) => {
  const userState = useSelector(({ onlineUser }) => onlineUser)
  if (localStorage.getItem('token') && !userState) {
    return <button>establishing connection</button>
  } else if (localStorage.getItem('token')) {
    return <button>Play Online</button>
  } else {
    return <button onClick={() => setIsModalOpen(true)}>
      Play Online
    </button>
  }
}

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return <main>
    <h1>Play Chess!</h1>
    <button>Play Locally</button>
    <PlayOnlineButton setIsModalOpen={setIsModalOpen} />
    <GuestAccountModal isDisplayed={isModalOpen} closeModal={() => setIsModalOpen(false)} />
  </main>
}

export default Home