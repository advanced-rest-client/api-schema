import { ApiAnyShape, ApiArrayShape, ApiDataNodeUnion, ApiExample, ApiFileShape, ApiNodeShape, ApiPropertyShape, ApiScalarShape, ApiSchemaShape, ApiShapeUnion, ApiTupleShape, ApiUnionShape } from '@api-components/amf-helper-mixin';
import { 
  ShapeBase,
  scalarShapeObject,
  nodeShapeObject,
  unionShapeObject,
  arrayShapeObject,
  propertyShapeObject,
  exampleToObject,
  fileShapeObject,
  schemaShapeObject,
  tupleShapeObject,
  anyShapeObject,
} from './ShapeBase.js';

interface ProcessNodeOptions {
  forceName?: string;
  indent?: number;
}

/**
 * Normalizes given name to a value that can be accepted by `createElement`
 * function on a document object.
 * @param name A name to process
 * @return Normalized name
 */
export function normalizeXmlTagName(name: string): string;

export const collectProperties: unique symbol;
export const unionDefaultValue: unique symbol;
export const readCurrentUnion: unique symbol;

export function shapeToXmlTagName(shape: ApiAnyShape): string;

export class ShapeXmlSchemaGenerator extends ShapeBase {
  /**
   * Generates a XML example from the structured value.
   * 
   * @param schema The Shape definition
   */
  generate(schema: ApiShapeUnion): string;

  /**
   * Processes the Shape definition and returns a JavaScript object or array.
   */
  processNode(schema: ApiShapeUnion, options?: ProcessNodeOptions): string;

  /**
   * Serializes generated JS value according to the mime type.
   */
  serialize(value: any): string|undefined;

  /**
   * Picks the union member to render.
   */
  [readCurrentUnion](anyOf: ApiShapeUnion[]): ApiShapeUnion;

  [collectProperties](schema: ApiNodeShape): ApiPropertyShape[];

  /**
   * @param fill The fill value (spaces)
   * @param value The value to format
   */
  formatValue(fill: string, value: any): string;

  [nodeShapeObject](schema: ApiNodeShape, options?: ProcessNodeOptions): string;

  /**
   * @param {ApiScalarShape} schema
   * @param {ProcessNodeOptions=} options
   * @returns {any|undefined}
   */
  [scalarShapeObject](schema: ApiScalarShape, options?: ProcessNodeOptions): string;

  /**
   * @returns The value for the property or undefined when cannot generate the value.
   */
  [propertyShapeObject](schema: ApiPropertyShape, options?: ProcessNodeOptions): string;

  [arrayShapeObject](schema: ApiArrayShape, options?: ProcessNodeOptions): string;

  /**
   * @param example The example to turn into a JS object
   */
  [exampleToObject](example: ApiExample): any|undefined;

  [unionShapeObject](schema: ApiUnionShape, options?: ProcessNodeOptions): string|undefined;

  /**
   * @param schema The schema with unions
   * @param defaultValue The definition of a default value.
   */
  [unionDefaultValue](schema: ApiShapeUnion, defaultValue: ApiDataNodeUnion, options?: ProcessNodeOptions): string;

  [fileShapeObject](schema: ApiFileShape): any;
  [schemaShapeObject](schema: ApiSchemaShape): any;
  [tupleShapeObject](schema: ApiTupleShape): any;
  [anyShapeObject](schema: ApiAnyShape): any;
}
