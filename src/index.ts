import * as CANNON from 'cannon'
import * as THREE from 'three'
import { Controls } from './controls'
import { PointerLockScreen } from './pointer-lock-screen'

var light, sphereShape, sphereBody, world, physicsMaterial, walls = [], balls = [], ballMeshes = [], boxes = [], boxMeshes = []

var camera, scene, renderer
var geometry, material, mesh
var controls, pointerLockScreen, time = Date.now()

initCannon()
init()
animate()

function initCannon() {
  // Setup our world
  world = new CANNON.World()
  world.quatNormalizeSkip = 0
  world.quatNormalizeFast = false

  var solver = new CANNON.GSSolver()

  world.defaultContactMaterial.contactEquationStiffness = 1e9
  world.defaultContactMaterial.contactEquationRelaxation = 4

  solver.iterations = 7
  solver.tolerance = 0.1
  var split = true
  if (split)
    world.solver = new CANNON.SplitSolver(solver)
  else
    world.solver = solver

  world.gravity.set(0, -20, 0)
  world.broadphase = new CANNON.NaiveBroadphase()

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
  world.addContactMaterial(physicsContactMaterial)

  // Create a sphere
  var mass = 5, radius = 1.3
  sphereShape = new CANNON.Sphere(radius)
  sphereBody = new CANNON.Body({ mass: mass })
  sphereBody.addShape(sphereShape)
  sphereBody.position.set(0, 5, 0)
  sphereBody.linearDamping = 0.9
  world.addBody(sphereBody)

  // Create a plane
  var groundShape = new CANNON.Plane()
  var groundBody = new CANNON.Body({ mass: 0 })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.addBody(groundBody)
}

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x000000, 0, 500)

  var ambient = new THREE.AmbientLight(0x111111)
  scene.add(ambient)

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
  scene.add(light)



  controls = new Controls(camera, sphereBody)
  pointerLockScreen = new PointerLockScreen(controls)
  scene.add(controls.getObject())

  // floor
  geometry = new THREE.PlaneGeometry(300, 300, 50, 50)
  geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2))

  material = new THREE.MeshLambertMaterial({ color: 0xdddddd })

  mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(scene.fog.color, 1)

  document.body.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

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
    world.addBody(boxBody)
    scene.add(boxMesh)
    boxBody.position.set(x, y, z)
    boxMesh.position.set(x, y, z)
    boxMesh.castShadow = true
    boxMesh.receiveShadow = true
    boxes.push(boxBody)
    boxMeshes.push(boxMesh)
  }
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

var dt = 1 / 60
function animate() {
  //@ts-ignore
  if (window.stats) window.stats.begin()

  if (controls.enabled) {
    world.step(dt)

    // Update ball positions
    for (var i = 0; i < balls.length; i++) {
      ballMeshes[i].position.copy(balls[i].position)
      ballMeshes[i].quaternion.copy(balls[i].quaternion)
    }

    // Update box positions
    for (var i = 0; i < boxes.length; i++) {
      boxMeshes[i].position.copy(boxes[i].position)
      boxMeshes[i].quaternion.copy(boxes[i].quaternion)
    }
  }

  controls.update(Date.now() - time)
  renderer.render(scene, camera)
  time = Date.now()

  //@ts-ignore
  if (window.stats) window.stats.end()

  requestAnimationFrame(animate)
}

var ballShape = new CANNON.Sphere(0.05)
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32)
var shootDirection = new THREE.Vector3()
var shootVelo = 50
var raycaster = new THREE.Raycaster()

function updateShootDir(shootDir) {
  raycaster.setFromCamera({x: 0, y: 0}, camera)
  shootDir.copy(raycaster.ray.direction)
}

function fire() {
  var x = sphereBody.position.x
  var y = sphereBody.position.y
  var z = sphereBody.position.z
  var ballBody = new CANNON.Body({ mass: 1 })
  ballBody.addShape(ballShape)
  var ballMesh = new THREE.Mesh(ballGeometry, material)
  world.addBody(ballBody)
  scene.add(ballMesh)
  ballMesh.castShadow = true
  ballMesh.receiveShadow = true
  balls.push(ballBody)
  ballMeshes.push(ballMesh)
  updateShootDir(shootDirection)
  ballBody.velocity.set(
    shootDirection.x * shootVelo,
    shootDirection.y * shootVelo,
    shootDirection.z * shootVelo
  )

  // Move the ball outside the player sphere
  x += shootDirection.x * (sphereShape.radius * 1.02 + ballShape.radius)
  y += shootDirection.y * (sphereShape.radius * 1.02 + ballShape.radius)
  z += shootDirection.z * (sphereShape.radius * 1.02 + ballShape.radius)
  ballBody.position.set(x, y, z)
  ballMesh.position.set(x, y, z)
}

var intervalRef

window.addEventListener("mousedown", function (e) {
  if (controls.enabled == true) {
    fire()
    intervalRef = intervalRef || window.setInterval(fire, 200)
  }
})

window.addEventListener("mouseup", function (e) {
  window.clearInterval(intervalRef)
  intervalRef = void (0)
})
