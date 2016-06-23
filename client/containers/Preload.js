import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import * as Actions from '../actions'
import auth from '../lib/auth';
import io from '../socket';

@connect( () => { return {} } )
export default class Preload extends Component {
  /**
   * On class initialization bind all the actions to the dispatch function.
   *
   * @param {Object} props
   */
  constructor(props) {
    super(props)
    this.actions = bindActionCreators(Actions, this.props.dispatch)
  }

  componentDidMount() {
    auth.fbInit()
    auth.whenReady(() => {
      io.connect(this.props.dispatch)

      io.socket.on('connect', () => {
        this.actions.goToLobby()
      })
    })
  }

  /**
   * Expected context object types.
   */
  static childContextTypes = {
    actions: PropTypes.object
  }

  /**
   * Getter for the child context object.
   */
  getChildContext() {
    return {
      actions: this.actions
    }
  }

  render() {
    return (
      <div>Loading the game...</div>
    )
  }
}
