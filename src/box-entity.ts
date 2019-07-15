import * as Three from 'three'
import * as Cannon from 'cannon'
import { Entity } from './entity'


const HALF_EXTENTS = new Cannon.Vec3(1, 1, 1)

export class BoxEntity extends Entity {
  public meshes: Array<Three.Mesh>
  public body: Cannon.Body

  constructor(world: Cannon.World, scene: Three.Scene) {
    super(world, scene)
  }
  
  animate() {
    this.meshes[0].position.copy(this.body.position)
    this.meshes[0].quaternion.copy(this.body.quaternion)
  }

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z)
    this.meshes[0].position.set(x, y, z)
  }

  _initMeshes() {
    let boxGeometry = new Three.BoxGeometry(HALF_EXTENTS.x * 2, HALF_EXTENTS.y * 2, HALF_EXTENTS.z * 2)
    let boxMaterial = new Three.MeshLambertMaterial({ color: 0xdddddd })
    let boxMesh = new Three.Mesh(boxGeometry, boxMaterial)
    boxMesh.castShadow = true
    boxMesh.receiveShadow = true
    this.meshes = [boxMesh]
    this._scene.add(boxMesh)
  }

  _initBody() {
    var boxShape = new Cannon.Box(HALF_EXTENTS)
    var boxBody = new Cannon.Body({ mass: 5 })
    boxBody.addShape(boxShape)
    this.body = boxBody
    this._world.addBody(boxBody)
  }
}