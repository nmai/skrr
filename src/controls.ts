import { Camera, Object3D, Vector3, Euler, Quaternion } from 'three'
import { Body, Vec3 } from 'cannon'

//@TODO: do we need to move these to a constants file? maybe not
const PI_2 = Math.PI / 2

const EYE_Y_POS = 2 // eyes are 2 meters above the ground
const PLAYER_VELOCITY_FACTOR = 0.2
const PLAYER_JUMP_VELOCITY = 20

export class Controls {
  public enabled: boolean //@TODO: Hide behind a getter interface

  private camera: Camera
  private cannonBody: Body

  private moveForward: boolean
  private moveBackward: boolean
  private moveLeft: boolean
  private moveRight: boolean
  private canJump: boolean
  private contactNormal: Vec3
  private upAxis: Vec3
  private pitchObject: Object3D
  private yawObject: Object3D
  private quat: Quaternion

  constructor(camera: Camera, cannonBody: Body) {
    this.camera = camera
    this.cannonBody = cannonBody
    this.enabled = false

    this.pitchObject = new Object3D()
    this.pitchObject.add( camera )
    
    this.yawObject = new Object3D()
    this.yawObject.position.y = 2
    this.yawObject.add( this.pitchObject )
    
    this.quat = new Quaternion()
    
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    
    this.canJump = false
    
    this.contactNormal = new Vec3() // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new Vec3(0,1,0)

    this.initListeners()
  }

  private initListeners() {
    this.cannonBody.addEventListener("collide", this.onCollision.bind(this))
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    document.addEventListener('keydown', this.onKeyDown.bind(this), false)
    document.addEventListener('keyup', this.onKeyUp.bind(this), false)
  }

  private onCollision(event: any) {
    var contact = event.contact

    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == this.cannonBody.id)  // bi is the player body, flip the contact normal
      contact.ni.negate(this.contactNormal)
    else
      this.contactNormal.copy(contact.ni) // bi is something else. Keep the normal as it is

    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    if (this.contactNormal.dot(this.upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
      this.canJump = true
  }
  
  private onMouseMove(event: MouseEvent | any) {  //@TODO: find a replacement for built-in DOM types supporting vendor prefix
    if (this.enabled === false)
      return
    
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0
    
    this.yawObject.rotation.y -= movementX * 0.002
    this.pitchObject.rotation.x -= movementY * 0.002
    
    this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) )
  }
  
  private onKeyDown (event: KeyboardEvent) {
    
    switch ( event.keyCode ) {
      
      case 38: // up
      case 87: // w
        this.moveForward = true
        break
      
      case 37: // left
      case 65: // a
        this.moveLeft = true
        break

      case 40: // down
      case 83: // s
        this.moveBackward = true
        break
      
      case 39: // right
      case 68: // d
        this.moveRight = true
        break
      
      case 32: // space
        if (this.canJump === true){
          this.cannonBody.velocity.y = PLAYER_JUMP_VELOCITY
        }
        this.canJump = false
        break
    }
    
  }
  
  private onKeyUp(event: KeyboardEvent) {
    
    switch( event.keyCode ) {
      
      case 38: // up
      case 87: // w
        this.moveForward = false
        break
      
      case 37: // left
      case 65: // a
        this.moveLeft = false
        break
      
      case 40: // down
      case 83: // a
        this.moveBackward = false
        break
      
      case 39: // right
      case 68: // d
        this.moveRight = false
        break
      
    }
    
  }
  
  public getObject(): Object3D { return this.yawObject }  //@TODO: this is a getter
  
  // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
  public update(delta: number) {
    var inputVelocity = new Vector3()
    var euler = new Euler()
    
    if ( this.enabled === false ) return
    
    delta *= 0.1
    
    inputVelocity.set(0,0,0)
    
    if ( this.moveForward ){
      inputVelocity.z = -PLAYER_VELOCITY_FACTOR * delta
    }
    if ( this.moveBackward ){
      inputVelocity.z = PLAYER_VELOCITY_FACTOR * delta
    }
    
    if ( this.moveLeft ){
      inputVelocity.x = -PLAYER_VELOCITY_FACTOR * delta
    }
    if ( this.moveRight ){
      inputVelocity.x = PLAYER_VELOCITY_FACTOR * delta
    }
    
    // Convert velocity to world coordinates
    euler.x = this.pitchObject.rotation.x
    euler.y = this.yawObject.rotation.y
    euler.order = "XYZ"
    this.quat.setFromEuler(euler)
    inputVelocity.applyQuaternion(this.quat)
    //quat.multiplyVector3(inputVelocity)
    
    // Add to the object
    this.cannonBody.velocity.x += inputVelocity.x
    this.cannonBody.velocity.z += inputVelocity.z
    
    this.yawObject.position.copy(new Vector3(
      this.cannonBody.position.x,
      this.cannonBody.position.y,
      this.cannonBody.position.z
    ))
  }
}
