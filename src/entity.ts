import * as Three from 'three'
import * as Cannon from 'cannon'

export abstract class Entity {
  meshes: Array<Three.Mesh>
  body: Cannon.Body

  _world: Cannon.World
  _scene: Three.Scene

  constructor(world: Cannon.World, scene: Three.Scene) {
    this._world = world
    this._scene = scene
    this._initMeshes()
    this._initBody()
  }

  animate() {}

  setPosition(x: number, y: number, z: number) {}

  _initMeshes() {}

  _initBody() {}
}
