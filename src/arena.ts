import * as CANNON from 'cannon'
import * as THREE from 'three'

export class Arena {
  private world: CANNON.World = new CANNON.World()
  private boxes: Array<THREE.Body> = []
  private balls: Array<THREE.Body> = []
  private time: number
  private renderer: THREE.Renderer
  private scene: THREE.Scene

  constructor() {
    this.initWorld()
    this.initArena()
    this.initScene()

    this.animate()
  }

  private initWorld() {
    // Setup our world
    this.world.quatNormalizeSkip = 0
    this.world.quatNormalizeFast = false

    let solver = new CANNON.GSSolver()

    this.world.defaultContactMaterial.contactEquationStiffness = 1e9
    this.world.defaultContactMaterial.contactEquationRelaxation = 4

    solver.iterations = 7
    solver.tolerance = 0.1
    var split = true
    if (split)
      this.world.solver = new CANNON.SplitSolver(solver)
    else
      this.world.solver = solver

    this.world.gravity.set(0, -40, 0)
    this.world.broadphase = new CANNON.NaiveBroadphase()
  }

  private initArena() {
    let physicsMaterial, walls = []

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial")
    var physicsContactMaterial = new CANNON.ContactMaterial(
      physicsMaterial,
      physicsMaterial,
      {
        friction: 0.0,
        restitution: 0.3
      }
    )
    // We must add the contact materials to the world
    this.world.addContactMaterial(physicsContactMaterial)

    // Create a plane
    var groundShape = new CANNON.Plane()
    var groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)
  }
}