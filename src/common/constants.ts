import * as Three from 'three'
import * as Cannon from 'cannon'

export const MATERIALS = {
  playerMaterial: new Cannon.Material('playerMaterial'),
  groundMaterial: new Cannon.Material('groundMaterial')
}

export const CONTACT_MATERIALS = {
  slipperyContactMaterial: new Cannon.ContactMaterial(
    MATERIALS.playerMaterial,
    MATERIALS.playerMaterial,
    {
      friction: 0.0,
      restitution: 0.0
    }
  ),
  slipperyGroundContactMaterial: new Cannon.ContactMaterial(
    MATERIALS.playerMaterial,
    MATERIALS.groundMaterial,
    {
      friction: 0.0,
      restitution: 0.0
    }
  )
}