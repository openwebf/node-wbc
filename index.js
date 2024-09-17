const { Wbc } = require('./wbc');
const Qjsc = require('./qjsc');
const parseAndConvertHTML = require('./html_converter');

function compileJavaScriptToWbc(code, version = '1') {
  const qjsc = new Qjsc({version: version});
  const wbc = new Wbc();
  const quickjsBuffer = qjsc.compile(code);
  let wbcBytecode = wbc.generateWbcBytecode(quickjsBuffer);
  return wbcBytecode;
}

function legacyCompileJavaScriptToKBC(code) {
  const qjsc = new Qjsc();
  return qjsc.compile(code);
}

function transformInlineScriptToWbc(html, version = '1') {
  return parseAndConvertHTML(html, version);
}

exports.compileJavaScriptToWbc = compileJavaScriptToWbc;
exports.transformInlineScriptToWbc = transformInlineScriptToWbc;
exports.legacyCompileJavaScriptToKBC = legacyCompileJavaScriptToKBC;