var lz4 = require('lz4');
const path = require('path');  

//each part of header length
const HEADER_LENGTH = 4;
const HEADER_CHUNK_TYPE = 4;
const HEADER_COMPRESSION_METHOD = 1;
const HEADER_COMPILE_LEVEL = 1;
const HEADER_BYTECODE_VERSION = 1;
const HEADER_ADDITIONAL_DATA = 3;
const HEADER_CRC32 = 4;

//each part of body length
const BODY_LENGTH = 4;
const BODY_CHUNK_TYPE = 4;
const BODY_CRC32 = 4;

//each part of end length
const END_LENGTH = 4;
const END_CHUNK_TYPE = 4;

const HEADER_FIELDS = [
    HEADER_LENGTH,
    HEADER_CHUNK_TYPE,
    HEADER_COMPRESSION_METHOD,
    HEADER_COMPILE_LEVEL,
    HEADER_BYTECODE_VERSION,
    HEADER_ADDITIONAL_DATA,
    HEADER_CRC32
];

class Wbc {
    constructor(options = {}) {
        const rootDir = path.resolve(__dirname, '..');  
        this._bindings = require('node-gyp-build')(rootDir);
    }

    getAdler32(buffer) {
        return this._bindings.getAdler32(buffer);
    }

    generateWbcBytecode(oriBody) {
        let signatureBuffer = this.generateSignature();
        let headerBuffer = this.generateHeader();
        let bodyBuffer = this.generateBody(oriBody);
        let endBuffer = this.generateEnd();

        let totalLength = signatureBuffer.length + headerBuffer.length + bodyBuffer.length + endBuffer.length;
        let bytecodeBuffer = Buffer.concat([signatureBuffer, headerBuffer, bodyBuffer, endBuffer], totalLength);
        return bytecodeBuffer;
    }

    //0x89 0x57 0x42 0x43 0x31 0x0D 0x0A 0x1A 0x0A
    generateSignature() {
        const buffer = Buffer.alloc(9);
        buffer.writeUInt8(0x89, 0);
        buffer.writeUInt8(0x57, 1);
        buffer.writeUInt8(0x42, 2);
        buffer.writeUInt8(0x43, 3);
        buffer.writeUInt8(0x31, 4);
        buffer.writeUInt8(0x0D, 5);
        buffer.writeUInt8(0x0A, 6);
        buffer.writeUInt8(0x1A, 7);
        buffer.writeUInt8(0x0A, 8);
        return buffer;
    }

    generateHeader() {
        let pointer = 0;
        let length = this.calculateHeaderLength();
        const headerBuffer = Buffer.alloc(length);

        //length
        headerBuffer.writeUInt32BE(length, 0);

        //ASCII value for the letter WBHD (0x57 0x42 0x48 0x44 in hexadecimal)
        pointer += HEADER_LENGTH;
        headerBuffer.writeUInt32BE(0x57424844, pointer);

        //compressionMethod
        pointer += HEADER_CHUNK_TYPE;
        headerBuffer.writeUInt8(0, pointer);

        //compileLevel
        pointer += HEADER_COMPRESSION_METHOD;
        headerBuffer.writeUInt8(0, pointer);

        //bytecodeVersion
        pointer += HEADER_COMPILE_LEVEL;
        headerBuffer.writeUInt8(0, pointer);

        //additionalData 3bytes
        pointer += HEADER_BYTECODE_VERSION;

        //Only the CRC32 value of the first 14 bytes is calculated because the last CRC32 field is reserved
        pointer += HEADER_ADDITIONAL_DATA;
        const adler32Value = this.getAdler32(headerBuffer.slice(0, pointer));

        // Write the calculated CRC32 value to the last 4 bytes of the Buffer
        headerBuffer.writeUInt32BE(adler32Value, pointer);
        return headerBuffer;
    }

    calculateHeaderLength() {
        return HEADER_FIELDS.reduce((sum, value) => sum + value, 0);
    }

    generateBody(oriBody) {
        let pointer = 0;
        //use lz4 to compress quickJs bytecode
        var bodyChunk = lz4.encode(oriBody);
        let length = BODY_LENGTH + BODY_CHUNK_TYPE + bodyChunk.length + BODY_CRC32;
        const bodyBuffer = Buffer.alloc(length);

        //length
        bodyBuffer.writeUInt32BE(length, 0);

        //ASCII value for the letter WBDY (0x57 0x42 0x44 0x59 in hexadecimal)
        pointer += BODY_LENGTH;
        bodyBuffer.writeUInt32BE(0x57424459, pointer);

        //body chunk
        pointer += BODY_CHUNK_TYPE;
        bodyChunk.copy(bodyBuffer, pointer);

        //crc32
        pointer += bodyChunk.length;
        const adler32Value = this.getAdler32(bodyBuffer.slice(0, pointer));

        // Write the calculated CRC32 value to the last 4 bytes of the Buffer
        bodyBuffer.writeUInt32BE(adler32Value, pointer);
        return bodyBuffer;
    }

    generateEnd() {
        let pointer = 0;
        let length = END_LENGTH + END_CHUNK_TYPE;
        const endBuffer = Buffer.alloc(length);

        //length
        endBuffer.writeUInt32BE(length, 0);

        //The ASCII values for the letters 'WEND' (0x57 0x45 0x4e 0x44 in hexadecimal).
        pointer += END_LENGTH;
        endBuffer.writeUInt32BE(0x57454e44, pointer);
        return endBuffer;
    }
}

exports.Wbc = Wbc
