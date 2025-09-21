function listRouterEndpoints(r, prefix = '') {
  const endpoints = [];
  const stack = r.stack || [];
  stack.forEach(layer => {
    if (layer.route) {
      const newPath = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).filter(m => layer.route.methods[m]);
      methods.forEach(m => endpoints.push({ method: m.toUpperCase(), path: newPath }));
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const newPrefix = prefix + (layer.regexp ? layer.regexp.source.replace('^\\/?', '').replace('(?:\\(\\.\\*\\))?\\/?$', '').replace('(\\W)', '/') : '');
      endpoints.push(...listRouterEndpoints(layer.handle, newPrefix));
    } else if (layer.regexp) {
      const newPrefix = prefix + (layer.regexp ? layer.regexp.source.replace('^\\/?', '').replace('(?:\\(\\.\\*\\))?\\/?$', '').replace('(\\W)', '/') : '');
      if (layer.handle && layer.handle.stack) {
        endpoints.push(...listRouterEndpoints(layer.handle, newPrefix));
      }
    }
  });
  
  return endpoints;
}

function getAllEndpoints(mainRouter) {
  return listRouterEndpoints(mainRouter);
}

module.exports = {
  listRouterEndpoints,
  getAllEndpoints
};
