import { ApiDataNode, ApiExample, ApiShapeUnion } from '@api-components/amf-helper-mixin';

/**
 * A class that processes AMF's Example object to read the example value
 * or to generate the example for the given media type.
 */
export declare class ApiExampleGenerator {
  /**
   * Reads or generates an example.
   * When the `mime` is set then it tries to "guess" whether the mime type corresponds to the value.
   * If it doesn't then it generates the example from the structured value, when possible.
   * @param example The structured value of the example
   * @param mime The optional mime type of the example. When not set it won't generate example from the structured value.
   * @param shape The optional shape containing this example to use with the XML examples which needs wrapping into an element.
   * @returns The read or generated example.
   */
  read(example: ApiExample, mime?: string, shape?: ApiShapeUnion): string|null;

  /**
   * Employs some basic heuristics to determine whether the given mime type patches the content.
   * @param mime The mime type for the value.
   * @param value The value.
   * @returns True when the value matches the mime type.
   */
  mimeMatches(mime: string, value: string): boolean;

  /**
   * Generates the example for the given structured value and the media type.
   * @param mime The mime type for the value.
   * @param structuredValue The structuredValue of the example.
   * @param shape The optional shape containing this example to use with the XML examples which needs wrapping into an element.
   * @returns The generated example or null if couldn't process the data.
   */
  fromStructuredValue(mime: string, structuredValue: ApiDataNode, shape?: ApiShapeUnion): string|null;

  /**
   * Wraps the generated XML example into an element according to the `shape` properties.
   */
  wrapXmlValue(value: string|null, shape?: ApiShapeUnion): string|null;
}
