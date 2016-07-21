import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {phases} from '../../common/constants'
import {checkGroupValidity, takeableJokerPosition} from '../../common/cards'

import StockPile from './StockPile'
import DiscardPile from './DiscardPile'
import GroupAdder from './GroupAdder'
import BoardGroup from './BoardGroup'
import BoardCard from './BoardCard'

// Helper function
const getCode = x => x.get('code')

@connect(state => ({
  gameStarted: state.game.getIn(['status', 'gameStarted']),
  phase: state.game.getIn(['status', 'phase']),
  stock: state.game.getIn(['cards', 'stock']),
  discard: state.game.getIn(['cards', 'discard']),
  board: state.game.getIn(['cards', 'board']),
  hand: state.game.get('hand'),
  isCurrent: state.game.getIn(['status', 'currentPlayer']) === state.game.get('seat')
}))
export default class GameAreaView extends Component {
  static propTypes = {
    gameStarted: PropTypes.bool.isRequired, /// Has the game started?
    isCurrent: PropTypes.bool.isRequired,   /// Is this our turn?
    stock: PropTypes.number.isRequired,     /// Number of cards on the stock
    discard: PropTypes.number.isRequired,   /// Number of cards on the stock
    board: PropTypes.array.isRequired,
    hand: PropTypes.arrayOf(PropTypes.string).isRequired,
    phase: PropTypes.oneOf(phases),         /// Current game phase

    onDrawFromStock: PropTypes.func.isRequired,
    onDrawFromDiscard: PropTypes.func.isRequired,
    onDiscard: PropTypes.func.isRequired,
    onMeldNewGroup: PropTypes.func.isRequired,
    onMeldExisting: PropTypes.func.isRequired,
    onTakeJoker: PropTypes.func.isRequired,
  }

  render() {
    if (this.props.gameStarted) {
      return (
        <div className="gameAreaView">
          <StockPile
            deck="classic"
            back="blue"
            numCards={this.props.stock}
            onClick={this._onClickStock}
            highlight={this.props.phase === phases.CARD_TAKING && this.props.isCurrent}
            />
          <DiscardPile
            deck="classic"
            lastCard={this.props.discard}
            onClick={this._onClickDiscard}
            highlight={this.canDiscard()}
            />
          { this.renderGroups() }
          { this.canAddGroup() && <GroupAdder canAdd={this.canAddGroup()} onClick={this._onAddGroup} /> }
        </div>
      )
    }
    else {
      return <div className="gameAreaView"></div>
    }

  }

  renderGroups() {
    let groups = this.props.board.map((group, index) => {
      group = group.toJS()
      let cards = group.map(code => <BoardCard key={code} code={code} deck="classic" />)
      return <BoardGroup
          key={index}
          canClick={this.canMeldExisting(group) || this.canTakeJoker(group)}
          onClick={() => this._onClickGroup(group)}
        >
          {cards}
        </BoardGroup>
    })
    return groups.toJS()
  }

  _onClickStock = () => {
    if (this.props.phase === phases.CARD_TAKING && this.props.isCurrent) {
      this.props.onDrawFromStock()
    }
  }

  _onClickDiscard = () => {
    if (this.props.phase === phases.CARD_TAKING && this.props.isCurrent) {
      // this.props.onDrawFromDiscard()
    }
    else if (this.canDiscard()) {
      this.props.onDiscard(this.getSelected().first().get('code'))
    }
  }

  _onClickGroup = (group) => {
    if (this.canMeldExisting(group)) {
      this.props.onMeldExisting(group, this.getSelectedCodes())
    }

    if (this.canTakeJoker(group)) {
      this.props.onTakeJoker(group)
    }
  }

  _onAddGroup = () => {
    if (this.canAddGroup()) {
      this.props.onMeldNewGroup(this.getSelectedCodes())
    }
  }

  canAddGroup = () => {
    return this.props.phase === phases.BASE_TURN && this.props.isCurrent
      && this.isValidGroup()
  }

  canMeldExisting = (group) => {
    return this.props.phase === phases.BASE_TURN && this.props.isCurrent
      && this.getSelected().size > 0
      && checkGroupValidity(this.getSelectedCodes().concat(group)).valid
  }

  canTakeJoker = (group) => {
    return this.props.phase === phases.BASE_TURN && this.props.isCurrent
      && this.getSelected().size === 0
      && takeableJokerPosition(group) > -1
  }

  canDiscard = () => {
    return this.props.phase === phases.BASE_TURN && this.props.isCurrent
      && this.getSelected().size === 1
  }

  isValidGroup = () => {
    return checkGroupValidity(this.getSelectedCodes()).valid
  }

  getSelected = () => {
    return this.props.hand.filter(card => card.get('selected'))
  }

  getSelectedCodes = () => {
    return this.getSelected().map(getCode).toJS()
  }

}
