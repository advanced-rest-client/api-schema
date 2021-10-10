# DEPRECATED

This component is being deprecated. The code base has been moved to [amf-components](https://github.com/advanced-rest-client/amf-components) module. This module will be archived when [PR 1](https://github.com/advanced-rest-client/amf-components/pull/1) is merged.

-----

A library that generates schemas from the AMF graph ld+json model.

## Usage

### Installation

```sh
npm install --save @api-components/api-schema
```

### Generating schemas

The library takes an AMF shape as the argument, a media type of the generated schema as the other argument and generates schema depending what is defined in the model and the configuration.

Scalars processing:

1. If the shape is not required and `renderOptional` is not set return undefined.
1. If there's an example and `renderExamples` is set then return parsed example value according to schema's data type
1. If there's a default value, return the default value according to schema's data type
1. If there's an enum value, return the first enum value according to schema's data type
1. Otherwise return a value that is a "default" value for the given data type ('', 0, false, null).

Objects are processed property-by-property as defined above.

Note, that the examples take precedence over the default or enum values. This is to make example generation consistent. If examples are processed after default value or enums then the result is a mix of examples and the other two, which is not what you expect.

For unions you can pass the `selectedUnions[]` configuration option which the ids of all explicitly selected union members. When the library cannot find a member in the `selectedUnions` array then it takes the first available member to process the schema.

Union of a scalar and `nil` (or multiple scalars and `nil`) is treated like an optional property and it doesn't render values if `renderOptional` is not set.

```javascript
import { ApiSchemaGenerator } from '@api-components/api-schema';

const shape = readAmfShapeSomehow()
const result = ApiSchemaGenerator.asSchema(shape, 'application/json', {
  renderOptional: true,
  renderExamples: true,
});
console.log(result);
```

### Generating Monaco schemas

Currently only NodeShape is supported when generating a Monaco schema.

```javascript
import { ApiMonacoSchemaGenerator } from '@api-components/api-schema';

const shape = readAmfShapeSomehow();
const reader = new ApiMonacoSchemaGenerator();
const result = reader.generate(shape, 'https://domain.com');
console.log(result);
```

### Reading schema values for form inputs

This class reads a value that should be rendered in a form input for the generated schema.
Note, there are two methods to read scalar and array values.
Also, this class operates on Parameters rather than Shapes.

```javascript
import { ApiSchemaValues } from '@api-components/api-schema';

const parameter = readAmfParameterSomehow();
const result = ApiSchemaValues.readInputValue(parameter);
console.log(result); // string, number, boolean, null, undefined, object, array

const arrayResult = ApiSchemaValues.readInputValues(parameter);
console.log(arrayResult); // list of: string, number, boolean, null, undefined, object, array

const inputType = ApiSchemaValues.readInputType('http://a.ml/vocabularies/shapes#number');
console.log(inputType); // "number"

const parsedValue = ApiSchemaValues.parseScalarInput('25', numberScalarShape);
console.log(parsedValue); // 25
```

### Reading example values from examples

This class specializes in reading and processing AMF examples to a form that should be rendered to the user
as an example value of a scheme or a property.

Note, that you need to provide a media type for which generate the value for. Currently the following media types are supported:

- application/json
- application/xml
- application/x-www-form-urlencoded

```javascript
import { ApiExampleGenerator } from '@api-components/api-schema';
const reader = new ApiExampleGenerator();
const shape = readAmfShapeSomehow();
const result = reader.read(shape.examples[0], 'application/json');
console.log(result); // a string representing a JSON value.
```

Note, when the example comes from a scalar shape the returned value is this scalar value which is not a valid JSON.

## Development

```sh
git clone https://github.com/advanced-rest-client/api-schema
cd api-schema
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
