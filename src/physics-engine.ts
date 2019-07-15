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

  public world: World

  constructor() {
    this.world = new World()
    this._initWorld()
    this._initMap()
  }

  private _initWorld() {
    // Setup our world
    this.world.quatNormalizeSkip = 0
    this.world.quatNormalizeFast = false

    let solver = new GSSolver()

    this.world.defaultContactMaterial.contactEquationStiffness = 1e9
    this.world.defaultContactMaterial.contactEquationRelaxation = 4

    solver.iterations = 7
    solver.tolerance = 0.1
    var split = true
    if (split)
      this.world.solver = new SplitSolver(solver)
    else
      this.world.solver = solver

    this.world.gravity.set(0, -40, 0)
    this.world.broadphase = new NaiveBroadphase()

    this.world.addEventListener('solver', console.log)
  }

  private _initMap() {

    // Create a slippery material (friction coefficient = 0.0)
    let physicsMaterial = new Material("slipperyMaterial")
    let physicsContactMaterial = new ContactMaterial(
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
    var groundShape = new Plane()
    var groundBody = new Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)
  }
}
