const WBC = require('./');

const wbc = new WBC();

describe('wbc', () => {
  it('throw error when empty arguments', () => {
    expect(() => wbc.compile()).toThrowError('1st arguments should be string.');
  });

  it('throw error when js syntax not correct', () => {
    const code = `
    function f() {

    console.log(111;

    `;
    expect(() => wbc.compile(code)).toThrowError();
  });

  it('return bytecode binary', () => {
    const code = `
    function f() { return 1 + '1234'; }
    f();
    `;
    let buffer = wbc.compile(code);
    expect(wbc._evalByteCode(buffer)).toBe('11234');
  });
});
