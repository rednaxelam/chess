import { useSelector } from 'react-redux'
import { useState } from 'react'
import { emitMakeDrawOffer, emitResetDrawOffers, emitNoDrawOffers, emitWantDrawOffers } from '../services/socketEmitters'
import store from '../store'

const emitDrawEvent = (drawEventEmitter, setExpectedDrawVersion) => {
  const version = store.getState().onlineGame.drawState.version
  drawEventEmitter(version)
  setExpectedDrawVersion(version + 1)
}

const useDrawInfo = () => {
  const drawState = useSelector(({ onlineGame })  => onlineGame?.drawState)
  const playerColor = useSelector(({ onlineGame }) => onlineGame?.gameState.playerColor)
  const isGameFinished = useSelector(({ onlineGame }) => onlineGame?.gameState.gameStatus >= 4)
  if (!drawState) return null
  const opponentColor = playerColor === 'white' ? 'black' : 'white'

  const playerDrawInfo = drawState[playerColor]
  const opponentDrawInfo = drawState[opponentColor]
  const version = drawState.version

  return { playerDrawInfo, opponentDrawInfo, version, isGameFinished }
}

const DrawStatusText = ({ playerDrawInfo, opponentDrawInfo }) => {
  if (!playerDrawInfo.wantsDrawOffers && !opponentDrawInfo.wantsDrawOffers) {
    return <p>Noone wants draw offers</p>
  } else if (!playerDrawInfo.wantsDrawOffers) {
    return <p>You don't want draw offers</p>
  } else if (!opponentDrawInfo.wantsDrawOffers) {
    return <p>Opponent doesn't want draw offers</p>
  } else if (playerDrawInfo.offersDraw) {
    return <p>Draw Offered</p>
  } else if (opponentDrawInfo.offersDraw) {
    return <p>Accept draw offer?</p>
  } else {
    return <p>---</p>
  }
}

const DrawOptions = ({ playerDrawInfo, opponentDrawInfo, isInteractivityDisabled, setExpectedDrawVersion }) => {
  if (!playerDrawInfo.wantsDrawOffers || !opponentDrawInfo.wantsDrawOffers) {
    return null
  } else {
    if (!isInteractivityDisabled) {
      if (!playerDrawInfo.offersDraw && !opponentDrawInfo.offersDraw) {
        return <button onClick={() => emitDrawEvent(emitMakeDrawOffer, setExpectedDrawVersion)}>Offer Draw</button>
      } else if (playerDrawInfo.offersDraw && !opponentDrawInfo.offersDraw) {
        return <button onClick={() => emitDrawEvent(emitResetDrawOffers, setExpectedDrawVersion)}>Withdraw Offer</button>
      } else if (!playerDrawInfo.offersDraw && opponentDrawInfo.offersDraw) {
        return <>
          <button onClick={() => emitDrawEvent(emitMakeDrawOffer, setExpectedDrawVersion)}>Accept</button>
          <button onClick={() => emitDrawEvent(emitResetDrawOffers, setExpectedDrawVersion)}>Decline</button>
        </>
      } else {
        return null
      }
    } else {
      return <p>attempting to send choice...</p>
    }
  }
}

const DrawOfferToggle = ({ playerDrawInfo, isInteractivityDisabled, setExpectedDrawVersion }) => {
  if (!isInteractivityDisabled) {
    if (playerDrawInfo.wantsDrawOffers) {
      return <button onClick={() => emitDrawEvent(emitNoDrawOffers, setExpectedDrawVersion)}>Reject All Offers</button>
    } else {
      return <button onClick={() => emitDrawEvent(emitWantDrawOffers, setExpectedDrawVersion)}>Enable Offers</button>
    }
  } else {
    return null
  }
}

const OnlineGameDrawMenu = () => {
  /* concurrent draw events could lead to one being rejected and receiving draw-state-out-of-sync in response */
  /* it might be worth thinking about how this could be indicated to the user at a later time */
  const [expectedDrawVersion, setExpectedDrawVersion] = useState(0)
  const drawInfo = useDrawInfo()

  if (!drawInfo) return <p>loading...</p>
  if (drawInfo.isGameFinished) return <p>Game Finished, no further draw actions can be taken</p>

  const isInteractivityDisabled = drawInfo.version < expectedDrawVersion

  const { playerDrawInfo, opponentDrawInfo } = drawInfo

  return <div style={{ border: '1px solid black' }}>
    <DrawStatusText playerDrawInfo={playerDrawInfo} opponentDrawInfo={opponentDrawInfo} />
    <DrawOptions playerDrawInfo={playerDrawInfo}
      opponentDrawInfo={opponentDrawInfo}
      isInteractivityDisabled={isInteractivityDisabled}
      setExpectedDrawVersion={setExpectedDrawVersion} />
    <br />
    <DrawOfferToggle playerDrawInfo={playerDrawInfo}
      isInteractivityDisabled={isInteractivityDisabled}
      setExpectedDrawVersion={setExpectedDrawVersion} />
  </div>

}

export default OnlineGameDrawMenu