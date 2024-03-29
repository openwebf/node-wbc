const supportedVersions = ['1'];

class Qjsc {
  constructor(options = {}) {
    let version = options.version || '1';
    if (supportedVersions.indexOf(version) === -1) {
      throw new Error('Unsupported WBC version: ' + version);
    }
    this._bindings = require('node-gyp-build')(__dirname);
  }
  help() {
    console.log('Supported WBC versions: ' + supportedVersions.join(', '));
  }

  getSupportedVersions() {
    return supportedVersions;
  }

  compile(code, options = {}) {
    let sourceURL = options.sourceURL || 'internal://';
    return this._bindings.dumpByteCode(code, sourceURL);
  }

  get version() {
    return this._bindings.version;
  }

  _evalByteCode(buffer) {
    return this._bindings.evalByteCode(buffer);
  }
}

module.exports = Qjsc;
