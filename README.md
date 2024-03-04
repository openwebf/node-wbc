# WBC

The [WBC](https://github.com/openwebf/rfc/blob/main/working/wbc1.en-US.md)(WebF bytecode file) file generator.

The WBC file is a specially designed binary file that contains pre-compiled JavaScript bytecodes and other assets, which could speed up the loading of WebF's application.

## Install

```
npm install wbc --save
```

## Usage

```javascript
const WBC = require('wbc');
const wbc = new WBC();

// Dump bytecode from javascript source;
wbc.compile('function hello() { return 1 + 1};'); // <Buffer ...>
```

## Contribute

**Generate compile_commands.json**

```
node-gyp configure -- -f gyp.generator.compile_commands_json.py
```

**Prebuild linux binary**

1. Install docker
2. Build local image with Dockerfile
  ```
  docker build -t qjsc .
  ```
3. Enter into images
  ```
  docker run --rm -it -v $(pwd):/project qjsc
  ```
4. Set up env in docker container
  ```
  cd project
  scl enable rh-nodejs12 bash
  scl enable devtoolset-7 bash
  ```
5. Build your binary
  ```
  npm install
  npm run prebuild
  ```
