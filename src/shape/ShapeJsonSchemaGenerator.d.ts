import { ApiAnyShape, ApiArrayShape, ApiDataNodeUnion, ApiExample, ApiFileShape, ApiNodeShape, ApiPropertyShape, ApiScalarShape, ApiSchemaShape, ApiShapeUnion, ApiTupleShape, ApiUnionShape } from '@api-components/amf-helper-mixin';
import { 
  ShapeBase,
  scalarShapeObject,
  nodeShapeObject,
  unionShapeObject,
  fileShapeObject,
  schemaShapeObject,
  arrayShapeObject,
  tupleShapeObject,
  anyShapeObject,
  propertyShapeObject,
  exampleToObject,
} from './ShapeBase.js';

export const unionDefaultValue: unique symbol;

export declare class ShapeJsonSchemaGenerator extends ShapeBase {
  /**
   * Generates a schema from AMF's shape.
   * 
   * @param schema The Shape definition
   */
  generate(schema: ApiShapeUnion): string|undefined;

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   */
  toObject(schema: ApiShapeUnion): any;
  serialize(value: any): string|undefined;
  [scalarShapeObject](schema: ApiScalarShape): any|undefined;

  /**
   * @todo: render examples, when available, first.
   */
  [nodeShapeObject](schema: ApiNodeShape): object;
  [unionShapeObject](schema: ApiUnionShape): any;

  /**
   * @param union The list of unions in the shape
   * @param defaultValue The definition of a default value.
   */
  [unionDefaultValue](union: ApiShapeUnion[], defaultValue: ApiDataNodeUnion): any|undefined;
  [arrayShapeObject](schema: ApiArrayShape): any[];
  [tupleShapeObject](schema: ApiTupleShape): any;
  [anyShapeObject](schema: ApiAnyShape): any;

  /**
   * @returns The value for the property or undefined when cannot generate the value.
   */
  [propertyShapeObject](schema: ApiPropertyShape): any|undefined;

  /**
   * @param example The example to turn into a JS object
   */
  [exampleToObject](example: ApiExample): any;

  [fileShapeObject](schema: ApiFileShape): any;
  [schemaShapeObject](schema: ApiSchemaShape): any;
}
