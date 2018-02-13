import { assert } from './utils';

function _findGetter(modul, actionName, prefix) {
  const resources = modul._rawModule.hagridResources;
  const getterName = resources && resources[actionName];
  const getter = getterName && modul._rawModule.getters && modul._rawModule.getters[getterName];
  if (getter) {
    return prefix + getterName;
  } else if (getterName) {
    throw new Error(`Found hagridResource for action "${prefix}${actionName}", but no getter called "${prefix}${getterName}" exists...`);
  }


  const nextSlashIx = actionName.indexOf('/');
  const namespacedNextPrefix = nextSlashIx > -1 && actionName.slice(0, nextSlashIx);
  const children = Object.keys(modul._children);

  for (let ix = 0; ix < children.length; ix++) {
    const moduleName = children[ix];
    const nextModule = modul._children[moduleName];

    if (nextModule._rawModule.namespaced) {
      if (nextSlashIx === -1) continue; // no slashes left in actionName, so can't be a namespaced
      if (moduleName !== namespacedNextPrefix) continue; // this module name doesn't match...
      const nextActionName = actionName.slice(nextSlashIx + 1);
      const foundGetter = _findGetter(nextModule, nextActionName, `${prefix}${namespacedNextPrefix}/`);
      if (foundGetter) return foundGetter;
    } else {
      // since this module isn't namespaced, pass through actionName and prefix.
      const foundGetter = _findGetter(nextModule, actionName, prefix);
      if (foundGetter) return foundGetter;
    }
  }

  if (
    modul._rawModule.actions &&
    modul._rawModule.actions[actionName] &&
    !getterName
  ) {
    throw new Error(`Found action "${prefix}${actionName}", but no getter is listed in hagridResources`);
  }

  // couldn't find it...
  return null;
}


export default function findGetter(store, actionName) {
  /*
   Walk the store, looking for an entry for `actionName` in a module's hagridResources.
   If it's found, return the fully qualified (namespaced) name of the associated getter.
  */
  const getterName = _findGetter(store._modules.root, actionName, '');
  assert(getterName, `unable to find action: ${actionName}`);
  assert(getterName in store.getters, `expected getter "${getterName}" for ${actionName} to exist`);
  return getterName;
}
