import ClientEngine from 'lance/ClientEngine'
import SpaaaceRenderer from '../client/SpaaaceRenderer'
import KeyboardControls from 'lance/controls/KeyboardControls'
import MobileControls from './MobileControls'
import Ship from '../common/Ship'
import Utils from '../common/Utils'

export default class SkrrClientEngine extends ClientEngine {

  constructor(gameEngine, options) {
    super(gameEngine, options, SpaaaceRenderer);
  }

  start() {
    super.start();

    // handle gui for game condition
    this.gameEngine.on('objectDestroyed', (obj) => {
      // change ui
    });

    this.gameEngine.once('renderer.ready', () => {
      // click event for "try again" button
      document.querySelector('#tryAgain').addEventListener('click', () => {
        this.socket.emit('requestRestart');
      });

      document.querySelector('#joinGame').addEventListener('click', (clickEvent) => {
        this.socket.emit('requestRestart')
      });

      document.querySelector('#reconnect').addEventListener('click', () => {
        window.location.reload()
      });

      //  Game input
      this.controls = new KeyboardControls(this);
      this.controls.bindKey('left', 'left', { repeat: true });
      this.controls.bindKey('right', 'right', { repeat: true });
      this.controls.bindKey('up', 'up', { repeat: true });
      this.controls.bindKey('space', 'space');
      
    });

    this.gameEngine.on('fireMissile', () => { this.sounds.fireMissile.play(); });
    this.gameEngine.on('missileHit', () => {
      // don't play explosion sound if the player is not in game
      if (this.renderer.playerShip) {
        this.sounds.missileHit.play();
      }
    });

    this.networkMonitor.on('RTTUpdate', (e) => {
      this.renderer.updateHUD(e);
    });
  }

  // extend ClientEngine connect to add own events
  connect() {
    return super.connect().then(() => {
      this.socket.on('scoreUpdate', (e) => {
        this.renderer.updateScore(e);
      });

      this.socket.on('disconnect', (e) => {
        console.log('disconnected');
        document.body.classList.add('disconnected');
        document.body.classList.remove('gameActive');
        document.querySelector('#reconnect').disabled = false;
      });

      if ('autostart' in Utils.getUrlVars()) {
        this.socket.emit('requestRestart');
      }
    });
  }

}