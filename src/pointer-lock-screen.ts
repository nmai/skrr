import { Controls } from './controls'

export class PointerLockScreen {
  private controls: Controls

  constructor(controls: Controls) {
    this.controls = controls
    this.initPointerLock()
  }

  //@TODO expose public??
  private initPointerLock() {
    //@TODO: append directly to document
    let blocker = document.getElementById('blocker')
    let instructions = document.getElementById('instructions')
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
    let self = this

    if (havePointerLock) {

      let element = document.body

      function pointerLockChange(event: Event) {

        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

          self.controls.enabled = true

          blocker.style.display = 'none'

        } else {

          self.controls.enabled = false

          blocker.style.display = '-webkit-box'
          blocker.style.display = '-moz-box'
          blocker.style.display = 'box'

          instructions.style.display = ''

        }

      }

      var pointerlockerror = function (event) {
        instructions.style.display = ''
      }

      // Hook pointer lock state change events
      document.addEventListener('pointerlockchange', pointerLockChange, false)
      document.addEventListener('mozpointerlockchange', pointerLockChange, false)
      document.addEventListener('webkitpointerlockchange', pointerLockChange, false)

      document.addEventListener('pointerlockerror', pointerlockerror, false)
      document.addEventListener('mozpointerlockerror', pointerlockerror, false)
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false)

      instructions.addEventListener('click', function (event) {
        instructions.style.display = 'none'

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock

        if (/Firefox/i.test(navigator.userAgent)) {

          var fullscreenchange = function (event) {

            if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

              document.removeEventListener('fullscreenchange', fullscreenchange)
              document.removeEventListener('mozfullscreenchange', fullscreenchange)

              element.requestPointerLock()
            }

          }

          document.addEventListener('fullscreenchange', fullscreenchange, false)
          document.addEventListener('mozfullscreenchange', fullscreenchange, false)

          element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen

          element.requestFullscreen()

        } else {

          element.requestPointerLock()

        }

      }, false)

    } else {

      instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API'

    }
  }
}