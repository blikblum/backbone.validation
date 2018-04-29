module.exports = function ({version}) {
  return {
    transform(source) {
      return {code: source.replace(/{{version}}/, version), map: null}
    }
  }
}