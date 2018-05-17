/* eslint-disable no-underscore-dangle */
function _walkModules(modul, prefix, cb) {
  // modul: vuex module
  // prefix: string
  // cb: function (module, prefix)
  cb(modul, prefix);
  const moduleNames = Object.keys(modul._children);
  moduleNames.forEach((name) => {
    const nextModule = modul._children[name];
    const nextPrefix = prefix && nextModule.namespaced ? `${prefix}/${name}` : name;
    _walkModules(nextModule, nextPrefix, cb);
  });
}

export default function walkModules(store, cb) {
  // store : Vuex.Store
  // cb: function (module, prefix)
  return _walkModules(store._modules.root, '', cb);
}
