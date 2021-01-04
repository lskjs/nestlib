/* global test expect */
import Module from '../src/2';

test('new Module()', () => {
  const instance = new Module();
  expect(instance).toEqual({
    __initAt: undefined,
    __runAt: undefined,
  });
});

test('instance.assignProps()', async () => {
  const instance = new Module();
  instance.assignProps({ a: 123 });
  expect(instance).toMatchObject({
    a: 123,
    __initAt: undefined,
    __runAt: undefined,
  });
});

test('instance.init() throw INVALID_NEW_MODULE without create', async () => {
  const instance = new Module();
  let err;
  try {
    await instance.init();
  } catch (error) {
    err = error;
  }
  expect(err.code).toBe('INVALID_NEW_MODULE');
  expect(instance).toMatchObject({
    __initAt: undefined,
    __runAt: undefined,
  });
});

test('Module.create()', async () => {
  const instance = await Module.create();
  expect(!!instance.__createdAt).toBe(true);
  expect(!!instance.__initAt).toBe(true);
  expect(!!instance.log).toBe(true);
  expect(instance).toMatchObject({
    name: 'Module2',
    __runAt: undefined,
  });
});

test('Module.createAndRun()', async () => {
  const instance = await Module.createAndRun();
  expect(!!instance.__createdAt).toBe(true);
  expect(!!instance.__initAt).toBe(true);
  expect(!!instance.__runAt).toBe(true);
  expect(!!instance.log).toBe(true);
  expect(instance).toMatchObject({
    name: 'Module2',
  });
});
