import './index.css'
import { KanjiFun } from './KanjiFun'
console.log('👋 This message is being logged by "renderer.js", included via webpack')
const appDiv = document.getElementById('app')
const kanjiFun = new KanjiFun(appDiv)

