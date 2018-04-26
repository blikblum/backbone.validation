module.exports = function ({version}) {
  return {
    transform(source) {
      return source.replace(/{{version}}/, version)
    }
  }
}