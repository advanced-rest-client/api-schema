import { ApiShapeUnion } from '@api-components/amf-helper-mixin';
import { ShapeBase } from './shape/ShapeBase.js';
import { SchemaExample, ShapeRenderOptions } from './types.js';

/**
 * A class that processes AMF's Shape to auto-generate a schema for a given media type.
 * This should be used when examples for the Shape are not available but the application still needs to 
 * render an example or a schema from the Shape.
 */
export declare class ApiSchemaGenerator {
  mime: string;
  opts: Readonly<ShapeRenderOptions>;
  generator?: ShapeBase;
  /**
   * @param mime The example mime type to format the generated example.
   * @param opts Optional configuration.
   */
  constructor(mime: string, opts?: ShapeRenderOptions);

  /**
   * @param shape The Shape definition
   * @param mime The mime type for the value.
   * @returns Customized Example with the `renderValue` that is the generated Example value.
   */
  static asExample(shape: ApiShapeUnion, mime: string, opts?: ShapeRenderOptions): SchemaExample|null;

  /**
   * @param shape The Shape definition
   * @param mime The mime type for the value.
   * @returns Generated schema
   */
  static asSchema(shape: ApiShapeUnion, mime: string, opts?: ShapeRenderOptions): object|string|number|boolean|null|undefined;

  /**
   * Generates the schema from the AMF shape.
   * 
   * @param shape The Shape definition
   */
  generate(shape: ApiShapeUnion): object|string|number|boolean|null|undefined;

  /**
   * @param shape The Shape definition
   */
  toValue(shape: ApiShapeUnion): object|string|number|boolean|null|undefined;

  /**
   * Generates an API Example object with the value to render.
   * @param shape The Shape definition
   * @returns Customized Example with the `renderValue` that is the generated Example value.
   */
  toExample(shape: ApiShapeUnion): SchemaExample|null;
}
