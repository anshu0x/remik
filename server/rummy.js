import {fromJS} from 'immutable'
// TODO: Move this file into common directory
import {phases} from '../client/constants'

// TODO: Move these into constants file
const ranks = [1,2,3,4,5,6,7,8,9,10,11,12,13],
  rankSymbols = {A: 1, J: 11, Q: 12, K: 13},
  suitSymbols = ['s', 'h', 'd', 'c']
const rankCodes = generateRankCodes(ranks, rankSymbols)
const INITIAL_CARDS = 13
const PLAYER_COLOURS = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan']

// FIXME: Maybe use the Immutables themselves instead of converting using toJS?
export function startGame(state) {
  state = clearBoard(state)
  let stock = shuffle(generateCards(state.get('settings').toJS()))
  state = dealCards(state.setIn(['cards', 'stock'], fromJS(stock)))

  let status = {
    gameStarted: true,
    phase: phases.CARD_TAKING,
    currentPlayer: randomSeat(state.get('players').toJS()),
    turnStartedAt: Date.now()
  }
  state = state.set('status', fromJS(status))

  return state
}

export function stopGame(state) {
  state = clearBoard(state)
  let status = {
    gameStarted: false,
    phase: phases.WAITING_FOR_PLAYERS,
    currentPlayer: null,
    turnStartedAt: null
  }
  return state.set('status', fromJS(status))
}

export function clearBoard(state) {
  let cards = {
    board: [],
    stock: [],
    discard: []
  }
  let players = state.get('players').toJS()
  for (let i in players) {
    players[i].cards = []
  }
  return state.set('cards', fromJS(cards)).set('players', fromJS(players))
}

export function meld(state, playerSeat, cards) {
  // TODO
  return state
}

// TODO: More checks!!!
// FIXME: Maybe use the Immutables themselves instead of converting using toJS?
export function drawCard(state, playerSeat, pileName) {
  let player = state.getIn(['players', playerSeat]).toJS(),
    stockPile = state.getIn(['cards', 'stock']).toJS(),
    discardPile = state.getIn(['cards', 'discard']).toJS()

  let drewCard
  if (pileName === 'stock') {
    drewCard = stockPile.pop()

    // If the stock is empty, use the shuffled cards from the discard pile
    if (stockPile.length <= 0) {
      let lastCard = discardPile.pop()
      stockPile = shuffle(discardPile.slice())
      discardPile = [lastCard]
    }
  }
  else if (pileName === 'discard') {
    drewCard = discardPile.pop()
    player.drewFromDiscard = drewCard
  }
  else {
    throw new Error("The pile name must be either 'stock' or 'discard'")
  }

  player.cards.push(drewCard)

  return state.setIn(['cards', 'stock'], fromJS(stockPile))
    .setIn(['cards', 'discard'], fromJS(discardPile))
    .setIn(['players', playerSeat], fromJS(player))
    .setIn(['status', 'phase'], phases.BASE_TURN)
    .set('drewCard', drewCard)
}

// FIXME: Maybe use the Immutables themselves instead of converting using toJS?
export function finishTurn(state, playerSeat, discarded) {
  let players = state.get('players').toJS(),
    discardPile = state.getIn(['cards', 'discard']).toJS(),
    player = players[playerSeat]

  let index = player.cards.indexOf(discarded)
  if (index < 0) {
    throw new Error("The card that's about to be discarded is not in player's hand")
  }

  player.cards.splice(index, 1)
  discardPile.push(discarded)

  return state.setIn(['players', playerSeat], fromJS(player))
    .setIn(['cards', 'discard'], fromJS(discardPile))
    .setIn(['status', 'currentPlayer'], nextPlayerSeat(playerSeat, players))
    .setIn(['status', 'phase'], phases.CARD_TAKING)
    .set('discardedCard', discarded)
}

// FIXME: Maybe use the Immutables themselves instead of converting using toJS?
function dealCards(state) {
  let stock = state.getIn(['cards', 'stock']).toJS(),
    discard = state.getIn(['cards', 'discard']).toJS(),
    players = state.get('players').toJS()
  for (let i = 0; i < INITIAL_CARDS; i++) {
    for (let seat in players) {
      players[seat].cards.push(stock.pop())
    }
  }

  discard.push(stock.pop())

  return state.setIn(['cards', 'stock'], fromJS(stock))
    .setIn(['cards', 'discard'], fromJS(discard))
    .set('players', fromJS(players))
}

function generateCards(settings) {
  let { deckCount, jokersPerDeck } = settings
  let stock = []

  for (let i = 0; i < deckCount; i++) {
    for (let suit of suitSymbols) {
      for (let rankCode of rankCodes) {
        stock.push(rankCode + suit + '.' + i)
      }
    }

    for (let i = 0; i < jokersPerDeck; i++) {
      stock.push('X.' + i)
    }
  }

  return stock
}

// FIXME: Ugly!
function generateRankCodes(ranks, rankSymbols) {
  let rankCodes = []

  for (let rank of ranks) {
    let found = false
    for (let symbol in rankSymbols) {
      if (rankSymbols[symbol] === rank) {
        rankCodes.push(symbol)
        found = true
      }
    }

    if (!found) {
      rankCodes.push(rank.toString())
    }
  }

  return rankCodes
}


function shuffle(array) {
  for (let i = array.length-1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i+1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

function randomSeat(players) {
  let seats = Object.keys(players)
  return seats[Math.floor(Math.random() * seats.length)]
}

function nextPlayerSeat(currentPlayerSeat, players) {
  let index = PLAYER_COLOURS.indexOf(currentPlayerSeat)
  if (index < 0) {
    return null
  }

  if (players[PLAYER_COLOURS[index+1]]) {
    return PLAYER_COLOURS[index+1]
  }
  else {
    return PLAYER_COLOURS[0]
  }
}
