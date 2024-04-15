const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const Qjsc = require('./qjsc');
const { Wbc } = require('./wbc');

const _replaceMap = {};
let _index = 1;

function generateReplaceKey(buffer) {
  const newIndex = _index++;
  _replaceMap[newIndex] = buffer;
  return `%@%${newIndex}%@%`;
}

function parseAndConvertHTML(html, version = '1') {
  let dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script');

  [].slice.call(scripts).forEach(script => {
    const textContent = script.textContent;
    if (textContent.length == 0) return;
    script.type = 'application/vnd.webf.bc1';

    const qjsc = new Qjsc();
    const wbc = new Wbc();
    const buffer = qjsc.compile(textContent);
    let wbcBytecode = wbc.generateWbcBytecode(buffer);

    script.textContent = generateReplaceKey(wbcBytecode);
  })

  const rawHtml = dom.window.document.documentElement.outerHTML;
  return replaceIndexWithByteCode(rawHtml);
}

function replaceIndexWithByteCode(html) {
  const byteArray = new Uint8Array(Buffer.from(html));
  const chunks = [];
  let start = 0;

  for (let i = 0; i < byteArray.length - 3; i ++) {
    if (byteArray[i] == 37 && byteArray[i + 1] == 64 && byteArray[i + 2] == 37) { // %@%
      chunks.push(Buffer.from(byteArray.slice(start, i).buffer));
      i += 2;
      let index;
      let amount = 0;
      while(byteArray[i + amount] == 48) { // '0
        amount++
      }
      index = amount * 10 + Number(String.fromCharCode(byteArray[i + amount + 1]));
      const byteCodeBuffer = _replaceMap[index];
      chunks.push(byteCodeBuffer);

      i += amount + 2;
      start = i + 3;
    }
  }

  chunks.push(byteArray.slice(start));

  let totalBuffer = Buffer.concat(chunks);
  return totalBuffer;
}


module.exports = parseAndConvertHTML;