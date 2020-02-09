/**
 *
 * Used for:
 *  project:
 *      name
 *      roles
 *  model:
 *      name
 *      attributes
 *      enum
 *  api:
 *      name
 *      param
 *
 */
exports.slug = function(str) {
  return str.replace(/-/g, "_").replace(/[^\w\_]+/g, "");
};

/**
 *
 * Used for:
 *  page:
 *      name
 *
 */
exports.slugPageName = function(str) {
  return str.replace(/[^\w\_\/]+/g, "");
};

/**
 *
 * Used for:
 *  page:
 *      url
 *  resource:
 *      url
 *  api:
 *      url
 *
 */
exports.slugUrl = function(str) {
  return str.replace(/[^\w\-\_\/\{\}]+/g, "");
};
