import './index.css'
import { KanjiFun } from './KanjiFun'
console.log('👋 漢字の楽しみ This message is being logged by "renderer.js", included via webpack')
const appDiv = document.getElementById('app')
const kanjiFun = new KanjiFun(appDiv)
kanjiFun.intro()
