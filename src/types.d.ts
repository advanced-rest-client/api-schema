import { ApiExample } from "@api-components/amf-helper-mixin";

export declare interface SchemaExample extends ApiExample {
  /**
   * The value to render as the example value.
   */
  renderValue?: string;
  label?: string;
}

export declare interface ShapeRenderOptions {
  /**
   * All selected unions in the current view.
   * When the processor encounter an union it checks this array
   * to pick the selected union.
   * When the selected union cannot be determined it picks the first union.
   */
  selectedUnions?: string[];
  /**
   * Whether to include optional fields into the schema.
   * @default false
   */
  renderOptional?: boolean;
  /**
   * When set it uses the data mocking library to generate the values
   * when examples and default are not set.
   */
  renderMocked?: boolean;
  /**
   * The library **always** uses default values in the schema.
   * When a default value is not set by default it inserts an empty value for 
   * the given data type ('', false, null, random date). When this is set
   * it includes examples in the generated value.
   */
  renderExamples?: boolean;
}

export interface MonacoSchema {
  uri: string;
  schema: MonacoProperty;
  fileMatch?: string[];
}

export interface MonacoProperty {
  $id?: string;
  title: string;
  type: string;
  description?: string;
  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface MonacoScalarProperty extends MonacoProperty {
  default?: string;
  pattern?: string;
  format?: string;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  enum?: string[];
}

export interface MonacoObjectProperty extends MonacoProperty {
  properties: Record<string, MonacoProperty>;
  required: string[];
  additionalProperties?: boolean;
  minProperties?: number;
  maxProperties?: number;
}

export interface MonacoArrayProperty extends MonacoProperty {
  additionalItems?: boolean;
  items: {
    anyOf: MonacoProperty[]
  }
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
  required: string[];
}

export interface ApiSchemaReadOptions {
  /**
   * Whether the value should be read only when the required property is set.
   */
  requiredOnly?: boolean;
  /**
   * Whether to read the examples to generate the value.
   */
  fromExamples?: boolean;
}
