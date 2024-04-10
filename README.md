# WBC

The [WBC](https://github.com/openwebf/rfc/blob/main/working/wbc1.en-US.md)(WebF bytecode file) file generator.

The WBC file is a specially designed binary file that contains pre-compiled JavaScript bytecodes and other assets, which could speed up the loading of WebF's application.

## Install

```
npm install @openwebf/wbc --save
```

## Cli Usage

**Install**
```
npm install @openwebf/wbc -g
```

**Convert JavaScript Into WBC file**

```
wbc -s /tmp/index.js -d /tmp
```

**Transform Inline Scripts in HTML**

```
wbc -s ./demo.html -d ./demo_wbc.html --convert-html
```

## Node Usage

**Convert JavaScript Into WBC buffer**

```javascript
const { compileJavaScriptToWbc } = require('@openwebf/wbc');

compileJavaScriptToWbc('function hello() { return 1 + 1};'); // <Buffer ...> the WBC bytes
```

**Transform Inline JavaScript Codes into WBC**

```javascript
const { transformInlineScriptToWbc } = require('@openwebf/wbc');

const transformedHtml = transformInlineScriptToWbc(`
<!DOCTYPE html>
<html lang="en">
<body>
    <script>
        console.log('helloworld');
    </script>
</body>
</html>
`); 

console.log(transformedHtml); /*
<html lang="en">
<body>
    <script>
    // The WBC binary contents
    </script>

</body></html>
*/

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
