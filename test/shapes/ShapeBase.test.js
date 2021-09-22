import { assert } from '@open-wc/testing';
import {
  ShapeBase,
  nodeShapeObject, 
  fileShapeObject, 
  propertyShapeObject, 
  arrayShapeObject, 
  tupleShapeObject,
  exampleToObject,
  scalarShapeObject,
  schemaShapeObject,
  anyShapeObject,
  unionShapeObject,
} from '../../src/shape/ShapeBase.js';

describe('ShapeBase', () => {
  describe('constructor()', () => {
    it('sets the readonly default options', () => {
      // @ts-ignore
      const inst = new ShapeBase();
      assert.typeOf(inst.opts, 'object')
    });
  });

  describe('abstract methods', () => {
    [
      'generate', 'serialize',
    ].forEach((fn) => {
      it(`returns undefined when calling ${fn}`, () => {
        // @ts-ignore
        const inst = new ShapeBase();
        const result = inst[fn]();
        assert.isUndefined(result);
      });
    });

    [
      exampleToObject, scalarShapeObject, nodeShapeObject, unionShapeObject,
      fileShapeObject, schemaShapeObject, arrayShapeObject, tupleShapeObject,
      anyShapeObject, propertyShapeObject,
    ].forEach((fn) => {
      it(`returns undefined when calling a symbol`, () => {
        // @ts-ignore
        const inst = new ShapeBase();
        const result = inst[fn]();
        assert.isUndefined(result);
      });
    });
  });
});
