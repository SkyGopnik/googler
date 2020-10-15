module.exports = function queryGet(key) {
  let p = window.location.search;
  p = p.match(new RegExp('(&|\\?)' + key + '=([^&=]+)'));
  return p ? p[2] : false;
};
