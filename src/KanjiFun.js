import * as THREE from 'three'
import debug from 'debug'
import Stats from 'three/addons/libs/stats.module.js'
import { Howl } from 'howler'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { Screen } from './Screen'
import shamisenSound from '../sounds/knto-015-94499.mp3'
import { loadSettings } from './settings'

const dbg = debug('KanjiFun')
debug.enable('KanjiFun')

const exampleConfig = {
  kvgDir: '',
}

class KanjiFun {
  constructor (appDiv) {
    this.settings = loadSettings('KanjiFun', exampleConfig)
    // TODO full type check and validation of settings
    if (this.settings.kvgDir?.length) {
      this.settings.kvgDir = this.settings.kvgDir.replace(/\\/g, '/')
    }
    window.settings.passSettingsToMain(this.settings)
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
    this.gui = new GUI({ width: 310 })
    this.gui.add(this, 'testKvg')
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

  async testKvg () {
    dbg('hello')
    // get an SVG image from the custom URL
    const cp = '066f8'
    const url = `kvg:///${this.settings.kvgDir}/kanji/${cp}.svg`
    await this.loadSvg(url, this.screen.scene)
  }

  async loadSvg (url, scene) {
    // taken from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_svg.html
    const guiData = {
      currentURL: '',
      drawFillShapes: true,
      drawStrokes: true,
      fillShapesWireframe: false,
      strokesWireframe: false
    }
    const loader = new SVGLoader()
    loader.load(url, (data) => {
      const group = new THREE.Group()
      group.scale.multiplyScalar(0.25)
      group.position.x = -70
      group.position.y = 70
      group.scale.y *= -1
      let renderOrder = 0
      for (const path of data.paths) {
        const fillColor = path.userData.style.fill
        if (guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setStyle(fillColor),
            opacity: path.userData.style.fillOpacity,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: guiData.fillShapesWireframe
          })
          const shapes = SVGLoader.createShapes(path)
          for (const shape of shapes) {
            const geometry = new THREE.ShapeGeometry(shape)
            const mesh = new THREE.Mesh(geometry, material)
            mesh.renderOrder = renderOrder++
            group.add(mesh)
          }
        }
        const strokeColor = path.userData.style.stroke
        if (guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setStyle(strokeColor),
            opacity: path.userData.style.strokeOpacity,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: guiData.strokesWireframe
          })
          for (const subPath of path.subPaths) {
            const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style)
            if (geometry) {
              const mesh = new THREE.Mesh(geometry, material)
              mesh.renderOrder = renderOrder++
              group.add(mesh)
            }
          }
        }
      }
      scene.add(group)
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
