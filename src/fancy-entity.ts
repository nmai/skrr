import * as Three from 'three'
import * as Cannon from 'cannon'
import { Entity } from './entity'
import { Quaternion, leftLeg } from 'three';


const METER = 1
const METER_VECTOR = new Cannon.Vec3(METER, METER, METER)
const LEG_LENGTH = METER
const THICKNESS = METER * .25
const TORSO_WIDTH = METER * .4
const TORSO_LENGTH = METER * .6
const HEAD_HEIGHT = METER * .3
const LEG_WIDTH = TORSO_WIDTH * .5


export class FancyEntity extends Entity {
  public meshes: Array<Three.Mesh>
  public body: Cannon.Body
  public container : Three.Object3D

  torso: Three.Mesh
  box2: Three.Mesh
  leftLeg: Three.Mesh
  rightLeg: Three.Mesh
  head: Three.Mesh
  legDirection: number

  constructor(world: Cannon.World, scene: Three.Scene) {
    super(world, scene)
    this.legDirection = 1
  }
  
  animate(delta: number) {
    this.container.position.copy(this.body.position)
    this.container.quaternion.copy(this.body.quaternion)
  
    this.swing(delta)
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z)
    this.container.position.set(x, y, z)
  }

  swing(delta: number) {
    let swingSize = Math.PI/9
    if (this.leftLeg.rotation.x >= swingSize){
      this.legDirection = -1
    }
    if (this.leftLeg.rotation.x <= -swingSize){
      this.legDirection = 1
    }

    let velocity = Math.cos(this.leftLeg.rotation.x*(2*Math.PI/5)/(Math.PI/9))
    let angle = Math.min(this.legDirection * 200 * (Math.PI / 180) * (Math.min(delta,100) / 1000))
    //console.log("velocity ", velocity)
    console.log("angle ", angle)
    console.log("delta ", delta)

    this.leftLeg.applyMatrix(new Three.Matrix4().makeRotationX(velocity*angle))
    this.rightLeg.applyMatrix(new Three.Matrix4().makeRotationX(-velocity*angle))

  }

  _initMeshes() {
    this.container = new Three.Object3D()
    this._scene.add(this.container)

    let boxMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 })

    let torsoGeometry = new Three.BoxGeometry(TORSO_WIDTH, TORSO_LENGTH, THICKNESS)
    this.torso = new Three.Mesh(torsoGeometry, boxMaterial)
    this.torso.castShadow = true
    this.torso.receiveShadow = true
    //this._scene.add(this.torso)
    this.torso.position.set(0,TORSO_LENGTH/2,0)
    this.container.add(this.torso)

  
    let boxGeometry2 = new Three.BoxGeometry(METER_VECTOR.x * 2, METER_VECTOR.y * 2, METER_VECTOR.z * 2)
    boxGeometry2.applyMatrix(new Three.Matrix4().makeTranslation(0,-2,0))
    this.box2 = new Three.Mesh(boxGeometry2, boxMaterial)
    this.box2.castShadow = true
    this.box2.receiveShadow = true
    this.container.add(this.box2)
    
    let boxGeometry3 = new Three.BoxGeometry(LEG_WIDTH, LEG_LENGTH, LEG_WIDTH)  //LEG
    let blueboxMaterial = new Three.MeshLambertMaterial({ color: 0x0000ff })

    this.rightLeg = new Three.Mesh(boxGeometry3, blueboxMaterial)
    this.rightLeg.castShadow = true
    this.rightLeg.receiveShadow = true
    this.container.add(this.rightLeg)
    this.rightLeg.position.set(-TORSO_WIDTH/2,-LEG_LENGTH/2,0)

    this.leftLeg = new Three.Mesh(boxGeometry3, blueboxMaterial)
    this.leftLeg.castShadow = true
    this.leftLeg.receiveShadow = true
    this.container.add(this.leftLeg)
    this.leftLeg.position.set(TORSO_WIDTH/2,-LEG_LENGTH/2,0)

    let boxGeometry4 = new Three.BoxGeometry(THICKNESS, HEAD_HEIGHT, THICKNESS) 
    this.head = new Three.Mesh(boxGeometry4, blueboxMaterial)
    this.head.castShadow = true
    this.head.receiveShadow = true
    this.container.add(this.head)
    this.head.position.set(0,TORSO_LENGTH+(HEAD_HEIGHT/2),0)

    // this.box2.position.set(1,1,1)
  }

  _initBody() {
    var boxShape = new Cannon.Box(METER_VECTOR)
    var boxBody = new Cannon.Body({ mass: 5 })
    boxBody.addShape(boxShape)
    this.body = boxBody
    this._world.addBody(boxBody)
  }
}