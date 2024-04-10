const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Qjsc = require('./qjsc');
const { Wbc } = require('./wbc');

function parseAndConvertHTML(html, version = '1') {
  let dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script');

  [].slice.call(scripts).forEach(script => {
    const textContent = script.textContent;
    if (textContent.length == 0) return;
    const qjsc = new Qjsc();
    const wbc = new Wbc();
    const buffer = qjsc.compile(textContent);
    let wbcBytecode = wbc.generateWbcBytecode(buffer);
    let code = wbcBytecode.toString('binary');
    script.textContent = code;
  })

  return dom.window.document.documentElement.outerHTML;
}


module.exports = parseAndConvertHTML;