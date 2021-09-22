import { ApiAnyShape, ApiArrayShape, ApiExample, ApiFileShape, ApiNodeShape, ApiPropertyShape, ApiScalarShape, ApiSchemaShape, ApiShapeUnion, ApiTupleShape, ApiUnionShape } from '@api-components/amf-helper-mixin';
import { Time } from '@pawel-up/data-mock';
import { ShapeRenderOptions } from '../types.js';

export const scalarShapeObject: unique symbol;
export const nodeShapeObject: unique symbol;
export const unionShapeObject: unique symbol;
export const fileShapeObject: unique symbol;
export const schemaShapeObject: unique symbol;
export const arrayShapeObject: unique symbol;
export const tupleShapeObject: unique symbol;
export const anyShapeObject: unique symbol;
export const propertyShapeObject: unique symbol;
export const exampleToObject: unique symbol;
// export const dataTypeToExample: unique symbol;
export const scalarValue: unique symbol;
export const isNotRequiredUnion: unique symbol;

/**
 * A base class for generators that generates a schema from AMF's shape definition.
 */
export abstract class ShapeBase {
  opts: Readonly<ShapeRenderOptions>;
  time: Time;
  
  constructor(opts?: ShapeRenderOptions);

  /**
   * Generates a schema from AMF's shape.
   * 
   * @param schema The Shape definition
   * @returns The generated example
   */
  abstract generate(schema: ApiShapeUnion): string|undefined;

  /**
   * Serializes generated values into the final mime type related form.
   * 
   * @returns The generated example
   */
  abstract serialize(value: any): string|undefined;
  [scalarValue](schema: ApiScalarShape): string|number|boolean;

  /**
   * Checks whether the union represents a scalar + nil which is equivalent 
   * to having scalar that is not required.
   * 
   * See more about nil values in RAML:
   * https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#nil-type
   * 
   * @param union The list of unions in the shape
   */
  [isNotRequiredUnion](union: ApiShapeUnion[]): boolean;

  /**
   * @param example The example to turn into a JS object
   */
  abstract [exampleToObject](example: ApiExample): any;
  abstract [scalarShapeObject](schema: ApiScalarShape): any;
  abstract [nodeShapeObject](schema: ApiNodeShape): any;
  abstract [unionShapeObject](schema: ApiUnionShape): any;
  abstract [fileShapeObject](schema: ApiFileShape): any;
  abstract [schemaShapeObject](schema: ApiSchemaShape): any;
  abstract [arrayShapeObject](schema: ApiArrayShape): any;
  abstract [tupleShapeObject](schema: ApiTupleShape): any;
  abstract [anyShapeObject](schema: ApiAnyShape): any;
  abstract [propertyShapeObject](schema: ApiPropertyShape): any;
}
