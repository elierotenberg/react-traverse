export default function isStatelessComponent(type) {
  return typeof type.prototype.render !== 'function';
}
