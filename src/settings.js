import yaml from 'js-yaml'

export function loadSettings (localStorageKey, defaultSettings) {
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
export function saveTheseSettings (localStorageKey, settings) {
  localStorage.setItem(localStorageKey, yaml.dump(settings))
  return structuredClone(settings)
}
