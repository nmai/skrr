import * as Three from 'three'
import * as Cannon from 'cannon'
import { Entity } from './entity'

const PLAYER_MASS = 5,
      METER = 1,
      METER_VECTOR = new Cannon.Vec3(METER, METER, METER),
      LEG_LENGTH = METER,
      THICKNESS = METER * .25,
      TORSO_WIDTH = METER * .4,
      TORSO_LENGTH = METER * .6,
      HEAD_HEIGHT = METER * .3,
      LEG_WIDTH = TORSO_WIDTH * .5


export class PlayerEntity extends Entity {
  public body: Cannon.Body
  public container: Three.Object3D

  torso: Three.Mesh
  box2: Three.Mesh
  leftLeg: Three.Mesh
  rightLeg: Three.Mesh
  legDirection: number = 1

  constructor(world: Cannon.World, scene: Three.Scene) {
    super(world, scene)
  }

  animate(delta: number) {
    console.log(this.body.position)
    this.container.position.copy(this.body.position)
    this.container.quaternion.copy(this.body.quaternion)

    this._swing(delta)
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z)
  }

  _initMeshes() {
    this.container = new Three.Object3D()
    this._scene.add(this.container)

    let boxMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 })

    let torsoGeometry = new Three.BoxGeometry(TORSO_WIDTH, TORSO_LENGTH, THICKNESS)
    this.torso = new Three.Mesh(torsoGeometry, boxMaterial)
    this.torso.castShadow = true
    this.torso.receiveShadow = true
    this.torso.position.set(0, TORSO_LENGTH / 2, 0)
    this.container.add(this.torso)


    let legGeometry = new Three.BoxGeometry(LEG_WIDTH, LEG_LENGTH, LEG_WIDTH)  //LEG
    let blueMaterial = new Three.MeshLambertMaterial({ color: 0x0000ff })

    this.rightLeg = new Three.Mesh(legGeometry, blueMaterial)
    this.rightLeg.castShadow = true
    this.rightLeg.receiveShadow = true
    this.container.add(this.rightLeg)
    this.rightLeg.position.set(-TORSO_WIDTH / 2, -LEG_LENGTH / 2, 0)

    this.leftLeg = new Three.Mesh(legGeometry, blueMaterial)
    this.leftLeg.castShadow = true
    this.leftLeg.receiveShadow = true
    this.container.add(this.leftLeg)
    this.leftLeg.position.set(TORSO_WIDTH / 2, -LEG_LENGTH / 2, 0)
  }

  _initBody() {
    var boxShape = new Cannon.Box(METER_VECTOR)
    var boxBody = new Cannon.Body({ mass: PLAYER_MASS })
    boxBody.addShape(boxShape)
    this.body = boxBody
    this._world.addBody(boxBody)
  }

  _swing(delta: number) {
    if (this.leftLeg.rotation.x >= .2618) {  //replace this number with pi/12
      this.legDirection = -1
    }
    if (this.leftLeg.rotation.x <= -.2618) {
      this.legDirection = 1
    }

    // 360 degrees per second
    let angle = this.legDirection * 60 * (Math.PI / 180) * (delta / 1000)

    this.leftLeg.applyMatrix(new Three.Matrix4().makeRotationX(angle))
    this.rightLeg.applyMatrix(new Three.Matrix4().makeRotationX(-angle))
  }
}