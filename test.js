const { compileJavaScriptToWbc } = require('./');
const Qjsc = require('./qjsc');
const path = require('path');

const testCode = '1 + "3"';

describe('compileJavaScriptToWbc', () => {
  const rootDir = path.resolve(__dirname, '.');
  const bindings = require('node-gyp-build')(rootDir);
  const signatureSize = 9;

  describe('Header', () => {
    it('header should contains signature', async () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect(Array.from(uint8Array.slice(0, 9))).toEqual([0x89, 0x57, 0x42, 0x43, 0x31, 0x0D, 0x0A, 0x1A, 0x0A]);
    });

    it('validate the header chunk header', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(9, 13)]).toEqual([0, 0, 0, 18]);
    });

    it('validate the chunk type', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(13, 17)]).toEqual([0x57, 0x42, 0x48, 0x44]);
    });

    it('validate compression method', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(17, 18)]).toEqual([0]);
    });

    it('validate compile level', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(18, 19)]).toEqual([0]);
    });

    it('validate bytecode version', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(19, 20)]).toEqual([0]);
    });

    it('validate additional data', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      expect([...uint8Array.slice(20, 23)]).toEqual([0, 0, 0]);
    });

    it('validate header check sum', () => {
      const bytes = compileJavaScriptToWbc(testCode);
      const uint8Array = new Uint8Array(bytes);
      const headerLength = uint8Array[12];
      const bodyOffset = signatureSize + headerLength;
      const headerCheckSumOffset = bodyOffset - 4;
      const checksum = bindings.getAdler32(uint8Array.slice(signatureSize, headerCheckSumOffset));
      const buffer = Buffer.alloc(4);
      buffer.writeUInt32BE(checksum, 0);
    
      expect([...new Uint8Array(buffer)]).toEqual([10, 168, 1, 56]);
    });
  });

  describe('Body', () => {
    const bytes = compileJavaScriptToWbc(testCode);
    const uint8Array = new Uint8Array(bytes);
    const headeLength = uint8Array.slice(12, 13)[0];
    const bodyHeader = uint8Array.slice(headeLength + 9);
    const bodyLength = bodyHeader[3];
    const bodySlice = uint8Array.slice(headeLength + 9, headeLength + bodyLength + 9);

    it('body should contains signature', () => {
      expect([...bodySlice.slice(4, 8)]).toEqual([0x57, 0x42, 0x44, 0x59]);
    });

    it('body content bytes should be executable', () => {
      const bytecode = bodySlice.slice(8, bodySlice.length - 4);
      const qjs = new Qjsc();
      const result = qjs._evalByteCode(Buffer.from(bytecode.buffer));
      expect(result).toBe('13');
    });
  });


});
