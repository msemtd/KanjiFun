import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { Howl } from 'howler'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { Screen } from './Screen'
import shamisenSound from '../sounds/knto-015-94499.mp3'
import yaml from 'js-yaml'

const exampleConfig = {
  kvgDir: '',
}

class KanjiFun {
  constructor (appDiv) {
    this.settings = loadSettings('KanjiFun', exampleConfig)
    this.screen = new Screen(appDiv)
    const c = this.screen
    c.scene.add(new THREE.AmbientLight())
    this.fog = new THREE.Fog(0x444444, 10, 200)
    c.scene.fog = this.fog
    addGrid(c.scene)
    {
      const axesHelper = new THREE.AxesHelper(5)
      axesHelper.name = 'axesHelper'
      c.scene.add(axesHelper)
    }
  }

  redraw () {
    this.screen.forceRedraw = true
  }

  addStats (c) {
    const stats = new Stats()
    c.container.appendChild(stats.dom)
    stats.domElement.style.cssText = 'position:absolute;top:40px;left:10px;'
    c.addMixer('stats', (_delta) => {
      stats.update()
      return false
    })
  }

  intro () {
    const sound = new Howl({ src: [shamisenSound], volume: 0.5 })
    sound.play()
  }
}

function addGrid (scene) {
  const width = 100
  const gridPos = new THREE.Vector3(0, 0, 0)
  const gridVisible = true

  const grid = new THREE.GridHelper(width, width)
  grid.geometry.rotateX(Math.PI / 2)

  grid.position.copy(gridPos)
  grid.name = 'grid'
  grid.visible = gridVisible
  scene.add(grid)
}

function loadSettings (localStorageKey, defaultSettings) {
  let settings = structuredClone(defaultSettings)
  const sy = localStorage.getItem(localStorageKey)
  if (!sy) { return saveTheseSettings(localStorageKey, defaultSettings) }
  try {
    settings = yaml.load(sy)
  } catch (error) {
    console.error(`failed to load settings key as YAML: ${error}`)
    return saveTheseSettings(localStorageKey, defaultSettings)
  }
  return settings
}

function saveTheseSettings (localStorageKey, settings) {
  localStorage.setItem(localStorageKey, yaml.dump(settings))
  return structuredClone(settings)
}

export { KanjiFun }
