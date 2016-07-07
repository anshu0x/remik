import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {phases} from '../constants'

import StockPile from './StockPile'
import DiscardPile from './DiscardPile'

@connect(state => {
  return {
    gameStarted: state.game.getIn(['status', 'gameStarted']),
    phase: state.game.getIn(['status', 'phase']),
    stock: state.game.getIn(['cards', 'stock']),
    discard: state.game.getIn(['cards', 'discard']),
    hand: state.game.get('hand'),
    isCurrent: state.game.getIn(['status', 'currentPlayer']) === state.game.get('seat')
  }
})
export default class GameAreaView extends Component {
  render() {
    if (this.props.gameStarted) {
      return (
        <div className="gameAreaView">
          <StockPile
            deck="classic"
            back="blue"
            numCards={this.props.stock}
            onClick={this._onClickStock}
            highlight={this.props.phase == phases.CARD_TAKING && this.props.isCurrent}
            />
          <DiscardPile
            deck="classic"
            lastCard={this.props.discard}
            onClick={this._onClickDiscard}
            highlight={this.canDiscard()}
            />
        </div>
      )
    }
    else {
      return <div className="gameAreaView"></div>
    }

  }

  _onClickStock = () => {
    if (this.props.phase == phases.CARD_TAKING && this.props.isCurrent) {
      this.props.onDrawFromStock()
    }
  }

  _onClickDiscard = () => {
    if (this.props.phase == phases.CARD_TAKING && this.props.isCurrent) {
      // this.props.onDrawFromDiscard()
    }
    else if (this.canDiscard()) {
      this.props.onDiscard(this.getSelected().first().get('code'))
    }
  }

  canDiscard = () => {
    console.log(this.getSelected().toJS())
    return this.props.phase == phases.BASE_TURN && this.getSelected().size == 1
  }

  getSelected = () => {
    return this.props.hand.filter(card => card.get('selected'))
  }

}
