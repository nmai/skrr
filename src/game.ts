import * as CANNON from 'cannon'
import * as THREE from 'three'
import { Controls } from './controls'
import { PointerLockScreen } from './pointer-lock-screen'
import { PhysicsEngine } from './physics-engine'
import { Entity } from './entity'
import { PlayerEntity } from './player-entity'
import { BoxEntity } from './box-entity';
import { FancyEntity } from './fancy-entity';

const DT = 1 / 60

export class Game {
  private camera: THREE.Camera
  private controls: Controls
  private time: number
  private renderer: THREE.Renderer
  private scene: THREE.Scene
  private phys: PhysicsEngine
  private entities: Array<Entity>
  private playerEntity: PlayerEntity

  constructor() {
    this.phys = new PhysicsEngine()
    this.entities = []
    
    this.initScene()

    this.playerEntity = new PlayerEntity(this.phys.world, this.scene)
    this.entities.push(this.playerEntity)

    let fancyEntity = new FancyEntity(this.phys.world, this.scene)
    fancyEntity.setPosition(0, 1, -5)

    this.initCameraAndControls()
    this.initBoxes()
    this.animate()
  }

  private initScene() {
    let light
    let geometry, material, mesh
    var pointerLockScreen
    this.time = Date.now()

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
  }

  initCameraAndControls() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.controls = new Controls(this.camera, this.playerEntity.body)
    this.scene.add(this.controls.getObject())
    let pointerLockScreen = new PointerLockScreen(this.controls)


    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }, false)
  }

  initBoxes() {
    for (var i = 0; i < 7; i++) {
      let box = new BoxEntity(this.phys.world, this.scene)
      var x = (Math.random() - 0.5) * 20
      var y = 1 + (Math.random() - 0.5) * 1
      var z = (Math.random() - 0.5) * 20
      box.setPosition(x, y, z)
      this.entities.push(box)
    }
  }

  animate() {
    //@ts-ignore
    if (window.stats) window.stats.begin()

    if (this.controls.enabled) {
      this.phys.world.step(DT)

      for (let entity of this.entities) {
        entity.animate()
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

