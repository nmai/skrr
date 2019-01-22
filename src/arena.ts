import * as CANNON from 'cannon'
import * as THREE from 'three'

export class Arena {
  private world: CANNON.World = new CANNON.World()
  private boxes: Array<THREE.Body> = []
  private balls: Array<THREE.Body> = []
}