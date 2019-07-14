import * as CANNON from 'cannon'
import * as THREE from 'three'
import { Controls } from './controls'
import { PointerLockScreen } from './pointer-lock-screen'

const PLAYER_MASS = 5, PLAYER_RADIUS = 1.3, DT = 1 / 60

export class Game {

  private world: CANNON.World = new CANNON.World()
  private playerBody: CANNON.Body = new CANNON.Body({ mass: PLAYER_MASS })
  private boxes: Array<CANNON.Body> = []
  // private boxMeshes: Array<THREE.Mesh> = []
  private balls: Array<CANNON.Body> = []
  // private ballMeshes: Array<THREE.Mesh> = []
  private camera: THREE.Camera
  private controls: Controls
  private time: number
  private renderer: THREE.Renderer
  private scene: THREE.Scene


  private meshes: Array<THREE.Mesh> = []
  

  constructor() {
    this.initWorld()
    this.initCannon()
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

  private initScene() {
    let light
    let geometry, material, mesh
    var pointerLockScreen
    this.time = Date.now()

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0x000000, 0, 500)

    var ambient = new THREE.AmbientLight(0x111111)
    this.scene.add(ambient)

    light = new THREE.SpotLight(0xffffff)
    light.position.set(10, 30, 20)
    light.target.position.set(0, 0, 0)
    if (true) {
      light.castShadow = true

      light.shadow.camera.near = 20
      light.shadow.camera.far = 50
      light.shadow.camera.fov = 40

      // light.shadow.bias = -0.001
      // light.shadowMapDarkness = 0.7
      light.shadow.mapSize.width = 2 * 512
      light.shadow.mapSize.height = 2 * 512
    }
    this.scene.add(light)



    this.controls = new Controls(this.camera, this.playerBody)
    pointerLockScreen = new PointerLockScreen(this.controls)
    this.scene.add(this.controls.getObject())

    // floor
    geometry = new THREE.PlaneGeometry(300, 300, 50, 50)
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2))

    material = new THREE.MeshLambertMaterial({ color: 0xdddddd })

    mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(this.scene.fog.color, 1)

    document.body.appendChild(this.renderer.domElement)

    window.addEventListener('resize', onWindowResize.bind(this), false)

    // Add boxes
    var halfExtents = new CANNON.Vec3(1, 1, 1)
    var boxShape = new CANNON.Box(halfExtents)
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
    for (var i = 0; i < 7; i++) {
      var x = (Math.random() - 0.5) * 20
      var y = 1 + (Math.random() - 0.5) * 1
      var z = (Math.random() - 0.5) * 20
      var boxBody = new CANNON.Body({ mass: 5 })
      boxBody.addShape(boxShape)
      var boxMesh = new THREE.Mesh(boxGeometry, material)
      this.world.addBody(boxBody)
      this.scene.add(boxMesh)
      boxBody.position.set(x, y, z)
      boxMesh.position.set(x, y, z)
      boxMesh.castShadow = true
      boxMesh.receiveShadow = true
      this.boxes.push(boxBody)
      // this.boxMeshes.push(boxMesh)
      this.meshes.push(boxMesh)
    }

    function onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
  }


  animate() {
    //@ts-ignore
    if (window.stats) window.stats.begin()

    if (this.controls.enabled) {
      this.world.step(DT)

      // // Update ball positions
      // for (var i = 0; i < this.balls.length; i++) {
      //   this.ballMeshes[i].position.copy(this.balls[i].position)
      //   this.ballMeshes[i].quaternion.copy(this.balls[i].quaternion)
      // }

      // // Update box positions
      // for (var i = 0; i < this.boxes.length; i++) {
      //   this.boxMeshes[i].position.copy(this.boxes[i].position)
      //   this.boxMeshes[i].quaternion.copy(this.boxes[i].quaternion)
      // }

      // Update box positions
      for (var i = 0; i < this.meshes.length; i++) {
        this.meshes[i].position.copy(this.boxes[i].position)
        this.meshes[i].quaternion.copy(this.boxes[i].quaternion)
      }
    }

    this.controls.update(Date.now() - this.time)
    this.renderer.render(this.scene, this.camera)
    this.time = Date.now()

    //@ts-ignore
    if (window.stats) window.stats.end()

    requestAnimationFrame(this.animate.bind(this))
  }

  // var ballShape = new CANNON.Sphere(0.05)
  // var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32)
  // var shootDirection = new THREE.Vector3()
  // var shootVelo = 50
  // var raycaster = new THREE.Raycaster()

  // function updateShootDir(shootDir) {
  //   raycaster.setFromCamera({x: 0, y: 0}, camera)
  //   shootDir.copy(raycaster.ray.direction)
  // }

  // fire() {
  //   var x = playerBody.position.x
  //   var y = playerBody.position.y
  //   var z = playerBody.position.z
  //   var ballBody = new CANNON.Body({ mass: 1 })
  //   ballBody.addShape(ballShape)
  //   var ballMesh = new THREE.Mesh(ballGeometry, material)
  //   this.world.addBody(ballBody)
  //   scene.add(ballMesh)
  //   ballMesh.castShadow = true
  //   ballMesh.receiveShadow = true
  //   balls.push(ballBody)
  //   this.meshes.push(ballMesh)
  //   updateShootDir(shootDirection)
  //   ballBody.velocity.set(
  //     shootDirection.x * shootVelo,
  //     shootDirection.y * shootVelo,
  //     shootDirection.z * shootVelo
  //   )

  //   // Move the ball outside the player sphere
  //   x += shootDirection.x * (playerShape.radius * 1.02 + ballShape.radius)
  //   y += shootDirection.y * (playerShape.radius * 1.02 + ballShape.radius)
  //   z += shootDirection.z * (playerShape.radius * 1.02 + ballShape.radius)
  //   ballBody.position.set(x, y, z)
  //   ballMesh.position.set(x, y, z)
  // }

}

// var intervalRef

// window.addEventListener("mousedown", function (e) {
//   if (controls.enabled == true) {
//     fire()
//     intervalRef = intervalRef || window.setInterval(fire, 200)
//   }
// })

// window.addEventListener("mouseup", function (e) {
//   window.clearInterval(intervalRef)
//   intervalRef = void (0)
// })

