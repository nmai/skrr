import {
  World,
  GSSolver,
  SplitSolver,
  NaiveBroadphase,
  Material,
  ContactMaterial,
  Plane,
  Body,
  Vec3
} from 'cannon'

export class PhysicsEngine {

  private world: World

  constructor() {
    this.world = new CANNON.World()
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

  private initCannon() {
    let physicsMaterial, walls = []

    let playerShape = new CANNON.Sphere(PLAYER_RADIUS)

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

    // Create a sphere
    this.playerBody.addShape(playerShape)
    this.playerBody.position.set(0, 5, 0)
    this.playerBody.linearDamping = 0.9
    this.world.addBody(this.playerBody)

    // Create a plane
    var groundShape = new CANNON.Plane()
    var groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)
  }
}