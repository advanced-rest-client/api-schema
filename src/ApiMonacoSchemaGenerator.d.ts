import { ApiArrayShape, ApiNodeShape, ApiPropertyShape, ApiScalarShape, ApiShapeUnion } from '@api-components/amf-helper-mixin';
import { MonacoArrayProperty, MonacoObjectProperty, MonacoScalarProperty, MonacoSchema } from './types';

/**
 * A class to generate JSON schema from an ApiShapeUnion declaration to use with the Monaco editor schemas.
 */
export declare class ApiMonacoSchemaGenerator {
  /**
   * @param parentUri The URI for the fileMatch property.
   */
  generate(schema: ApiShapeUnion, parentUri: string): MonacoSchema[];

  /**
   * @param parentUri The URI for the fileMatch property.
   */
  fromNodeShape(schema: ApiNodeShape, parentUri?: string): MonacoSchema[];

  appendSchemaProperty(content: MonacoObjectProperty, property: ApiPropertyShape): void;

  rangeToPropertySchema(range: ApiShapeUnion): MonacoScalarProperty | MonacoObjectProperty | MonacoArrayProperty;

  scalarRangeToPropertySchema(schema: ApiScalarShape): MonacoScalarProperty;

  /**
   * Translates AMF data type to JSON schema data type.
   */
  schemaTypeToJsonDataType(schemaType: string): string;

  nodeShapeRangeToPropertySchema(schema: ApiNodeShape): MonacoObjectProperty;

  arrayShapeRangeToPropertySchema(schema: ApiArrayShape): MonacoArrayProperty;
}
