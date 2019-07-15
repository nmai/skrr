import * as Three from 'three'
import * as Cannon from 'cannon'
import { Entity } from './entity'
import { Quaternion, leftleg } from 'three';


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
  leftleg: Three.Mesh

  constructor(world: Cannon.World, scene: Three.Scene) {
    super(world, scene)
  }
  
  animate(delta: number) {
    this.container.position.copy(this.body.position)
    this.container.quaternion.copy(this.body.quaternion)

    
    // this.box2.quaternion.copy(this.body.quaternion)
    let posvector = new Three.Vector3(0,5,0)
    this.box2.position.add(posvector)

    // 360 degrees per second
    let angle = 360 * (Math.PI / 180) * (delta / 1000)

    this.leftleg.applyMatrix(new Three.Matrix4().makeRotationX(angle))
    
    
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z)
    this.container.position.set(x, y, z)
  }

  swing() {
    
  }

  _initMeshes() {
    this.container = new Three.Object3D()
    this._scene.add(this.container)

    let boxGeometry = new Three.BoxGeometry(TORSO_WIDTH * 2, TORSO_LENGTH * 2, THICKNESS * 2)
    let boxMaterial = new Three.MeshLambertMaterial({ color: 0xff0000 })

    this.torso = new Three.Mesh(boxGeometry, boxMaterial)
    this.torso.castShadow = true
    this.torso.receiveShadow = true
    //this._scene.add(this.torso)
    this.torso.position.set(0,TORSO_LENGTH/2,0)

  
    let boxGeometry2 = new Three.BoxGeometry(METER_VECTOR.x * 2, METER_VECTOR.y * 2, METER_VECTOR.z * 2)
    boxGeometry2.applyMatrix(new Three.Matrix4().makeTranslation(0,-2,0))
    this.box2 = new Three.Mesh(boxGeometry2, boxMaterial)
    this.box2.castShadow = true
    this.box2.receiveShadow = true
    this.container.add(this.box2)
    
    let boxGeometry3 = new Three.BoxGeometry(.1, .25, .1)  //LEG
    let blueboxMaterial = new Three.MeshLambertMaterial({ color: 0x0000ff })
    this.leftleg = new Three.Mesh(boxGeometry3, blueboxMaterial)
    this.leftleg.castShadow = true
    this.leftleg.receiveShadow = true
    this.container.add(this.leftleg)

    this.container.add(this.torso)

    this.leftleg.position.set(TORSO_WIDTH/2,LEG_LENGTH/2,0)

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