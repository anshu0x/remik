import {Map} from 'immutable'

import actionTypes from '../actions/actionTypes'

const initialState = Map({
  messages: []
})

/**
 * Default reducer
 *
 * @param {Immutable.Map} state The state to be reduced
 * @param {object} action The action passed to the reducer
 * @return {Immutable.Map} state The resulting state
 */
export default (state = initialState, action) => {
  switch (action.type) {
  case actionTypes.SWITCH_SCREEN:
    return initialState

  case actionTypes.RECEIVE_MESSAGE:
    return addMessage(state, action.data)

  case actionTypes.room.USER_JOINED:
    return addMessage(state, {
      user: action.user,
      code: 'user_joined_spectating'
    })

  case actionTypes.room.USER_LEFT:
    return addMessage(state, {
      user: action.user,
      code: 'user_left'
    })

  case actionTypes.game.USER_JOINED:
    return addMessage(state, {
      user: action.user,
      code: 'user_joined_playing'
    })

  case actionTypes.game.STARTED:
    return addMessage(state, {
      message: 'The game may now start!'
    })

  default:
    return state
  }
}

function addMessage(state, data) {
  return state.set('messages', [...state.get('messages'), data])
}
