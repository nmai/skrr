import * as Three from 'three'
import * as Cannon from 'cannon'
import { Entity } from './entity'

const PLAYER_MASS = 5, PLAYER_RADIUS = 1.3

export class PlayerEntity extends Entity {
  public meshes: Array<Three.Mesh>
  public body: Cannon.Body

  constructor(world: Cannon.World, scene: Three.Scene) {
    super(world, scene)
  }

  animate() {}

  setPosition(x: number, y: number, z: number) {
    this.body.position.set(x, y, z)
  }

  _initMeshes() {
  }

  _initBody() {
    this.body = new Cannon.Body({ mass: PLAYER_MASS })
    let playerShape = new Cannon.Sphere(PLAYER_RADIUS)
    // Create a sphere
    this.body.addShape(playerShape)
    this.body.position.set(0, 5, 0)
    this.body.linearDamping = 0.9
    this._world.addBody(this.body)
  }
}