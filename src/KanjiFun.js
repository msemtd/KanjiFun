import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { Screen } from './Screen'

class KanjiFun {
  constructor (appDiv) {
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

export { KanjiFun }
