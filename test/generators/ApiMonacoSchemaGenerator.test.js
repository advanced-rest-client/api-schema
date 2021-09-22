import { ns } from '@api-components/amf-helper-mixin';
import { assert } from '@open-wc/testing';
import { ApiMonacoSchemaGenerator } from '../../src/ApiMonacoSchemaGenerator.js';
import { TestHelper } from '../TestHelper.js';

/** @typedef {import('@api-components/amf-helper-mixin').AmfDocument} AmfDocument */
/** @typedef {import('@api-components/amf-helper-mixin').ApiExample} ApiExample */
/** @typedef {import('../../src/types').MonacoObjectProperty} MonacoObjectProperty */
/** @typedef {import('../../src/types').MonacoScalarProperty} MonacoScalarProperty */
/** @typedef {import('../../src/types').MonacoArrayProperty} MonacoArrayProperty */

describe('ApiMonacoSchemaGenerator', () => {
  /** @type TestHelper */
  let store;
  before(async () => {
    store = new TestHelper();
  });

  describe('generate()', () => {
    const parentUri = 'https://domain.com';

    /** @type ApiMonacoSchemaGenerator */
    let reader;
    /** @type AmfDocument */
    let model;

    before(async () => {
      model = await store.getGraph('demo-api');
      reader = new ApiMonacoSchemaGenerator();
    });

    it('creates a schema for an object', async () => {
      const shape = store.getShape(model, 'SimpleObject');
      const result = reader.generate(shape, parentUri);

      assert.typeOf(result, 'array', 'result is an array');
      const [object] = result;
      assert.equal(object.uri, shape.id, 'has uri');
      assert.deepEqual(object.fileMatch, [parentUri], 'has fileMatch');
      const schema = /** @type MonacoObjectProperty */ (object.schema);
      assert.typeOf(schema, 'object', 'has schema');
      
      assert.equal(schema.title, 'SimpleObject', 'has schema.title');
      assert.equal(schema.type, 'object', 'has schema.type');
      assert.typeOf(schema.properties, 'object', 'has schema.properties');
      assert.deepEqual(schema.required, [ 'id', 'name', 'sex', 'tosAccepted' ], 'has schema.required');

      const id = /** @type MonacoScalarProperty */ (schema.properties.id);
      assert.typeOf(id.$id, 'string', 'id.$id is set');
      assert.equal(id.type, 'string', 'id.type is set');
      assert.equal(id.title, 'id', 'id.title is set');

      const name = /** @type MonacoScalarProperty */ (schema.properties.name);
      assert.typeOf(name.$id, 'string', 'name.$id is set');
      assert.equal(name.type, 'string', 'name.type is set');
      assert.equal(name.title, 'Name', 'name.title is set');

      const age = /** @type MonacoScalarProperty */ (schema.properties.age);
      assert.typeOf(age.$id, 'string', 'age.$id is set');
      assert.equal(age.type, 'number', 'age.type is set');
      assert.equal(age.title, 'age', 'age.title is set');
      assert.equal(age.description, 'Optional person age.', 'age.description is set');
      assert.equal(age.minimum, 18, 'age.minimum is set');

      const sex = /** @type MonacoScalarProperty */ (schema.properties.sex);
      assert.typeOf(sex.$id, 'string', 'sex.$id is set');
      assert.equal(sex.type, 'string', 'sex.type is set');
      assert.equal(sex.title, 'sex', 'sex.title is set');
      assert.equal(sex.description, 'An example of an enum.', 'sex.description is set');
      assert.deepEqual(sex.enum, ['male', 'female'], 'sex.enum is set');

      const newsletter = /** @type MonacoScalarProperty */ (schema.properties.newsletter);
      assert.typeOf(newsletter.$id, 'string', 'newsletter.$id is set');
      assert.equal(newsletter.type, 'boolean', 'newsletter.type is set');
      assert.equal(newsletter.title, 'newsletter', 'newsletter.title is set');
      assert.equal(newsletter.description, 'Whether the user wants to be added to the newsletter', 'newsletter.description is set');

      const tosAccepted = /** @type MonacoScalarProperty */ (schema.properties.tosAccepted);
      assert.typeOf(tosAccepted.$id, 'string', 'tosAccepted.$id is set');
      assert.equal(tosAccepted.type, 'boolean', 'tosAccepted.type is set');
      assert.equal(tosAccepted.title, 'tosAccepted', 'tosAccepted.title is set');
      assert.equal(tosAccepted.description, 'Whether terms of service is accepted by the user.', 'tosAccepted.description is set');
      assert.equal(tosAccepted.default, 'false', 'tosAccepted.default is set');
    });

    it('creates a schema for an object with a parent', async () => {
      const shape = store.getShape(model, 'ObjectWithParent');
      const result = reader.generate(shape, parentUri);
      
      assert.typeOf(result, 'array', 'result is an array');
      const [object] = result;
      assert.equal(object.uri, shape.id, 'has uri');
      assert.deepEqual(object.fileMatch, [parentUri], 'has fileMatch');
      const schema = /** @type MonacoObjectProperty */ (object.schema);
      assert.typeOf(schema, 'object', 'has schema');

      assert.equal(schema.title, 'ObjectWithParent', 'has schema.title');
      assert.equal(schema.type, 'object', 'has schema.type');
      assert.typeOf(schema.properties, 'object', 'has schema.properties');
      const required = [ 'addedProperty', 'age', 'id', 'name', 'sex', 'tosAccepted' ];
      schema.required.forEach(r => assert.include(required, r, `required has ${r}`));

      const id = /** @type MonacoScalarProperty */ (schema.properties.id);
      const name = /** @type MonacoScalarProperty */ (schema.properties.name);
      const sex = /** @type MonacoScalarProperty */ (schema.properties.sex);
      const newsletter = /** @type MonacoScalarProperty */ (schema.properties.newsletter);
      const tosAccepted = /** @type MonacoScalarProperty */ (schema.properties.tosAccepted);
      assert.ok(id, 'has parent id property');
      assert.ok(name, 'has parent name property');
      assert.ok(sex, 'has parent sex property');
      assert.ok(newsletter, 'has parent newsletter property');
      assert.ok(tosAccepted, 'has parent tosAccepted property');

      const addedProperty = /** @type MonacoScalarProperty */ (schema.properties.addedProperty);
      assert.typeOf(addedProperty.$id, 'string', 'addedProperty.$id is set');
      assert.equal(addedProperty.type, 'string', 'addedProperty.type is set');
      assert.equal(addedProperty.title, 'addedProperty', 'addedProperty.title is set');
      assert.equal(addedProperty.format, 'time', 'addedProperty.format is set');

      const age = /** @type MonacoScalarProperty */ (schema.properties.age);
      assert.typeOf(age.$id, 'string', 'age.$id is set');
      assert.equal(age.type, 'number', 'age.type is set');
      assert.equal(age.title, 'age', 'age.title is set');
      assert.equal(age.description, 'Age is not optional anymore.', 'age.description is set');
      assert.equal(age.minimum, 18, 'age.minimum is set');
    });

    it('creates a schema for an object with array values', async () => {
      const shape = store.getShape(model, 'ObjectWithArray');
      const result = reader.generate(shape, parentUri);
      
      assert.typeOf(result, 'array', 'result is an array');
      const [object] = result;
      assert.equal(object.uri, shape.id, 'has uri');
      assert.deepEqual(object.fileMatch, [parentUri], 'has fileMatch');
      const schema = /** @type MonacoObjectProperty */ (object.schema);
      assert.typeOf(schema, 'object', 'has schema');
      
      const tags = /** @type MonacoArrayProperty */ (schema.properties.tags);
      assert.typeOf(tags.$id, 'string', 'tags.$id is set');
      assert.equal(tags.type, 'array', 'tags.type is set');
      assert.equal(tags.title, 'tags', 'tags.title is set');
      assert.equal(tags.description, 'These are tags', 'tags.description is set');
      assert.deepEqual(tags.required, [], 'tags.required is set');
      assert.isFalse(tags.additionalItems, 'tags.additionalItems is set');
      const { items } = tags;
      assert.equal(items.anyOf[0].type, 'string');
    });
  });

  describe('schemaTypeToJsonDataType()', () => {
    /** @type ApiMonacoSchemaGenerator */
    let reader;

    before(async () => {
      reader = new ApiMonacoSchemaGenerator();
    });

    [
      [ns.w3.xmlSchema.number, 'number'],
      [ns.aml.vocabularies.shapes.number, 'number'],
      [ns.w3.xmlSchema.integer, 'number'],
      [ns.aml.vocabularies.shapes.integer, 'number'],
      [ns.w3.xmlSchema.float, 'number'],
      [ns.aml.vocabularies.shapes.float, 'number'],
      [ns.w3.xmlSchema.long, 'number'],
      [ns.aml.vocabularies.shapes.long, 'number'],
      [ns.w3.xmlSchema.double, 'number'],
      [ns.aml.vocabularies.shapes.double, 'number'],
      [ns.aml.vocabularies.shapes.boolean, 'boolean'],
      [ns.w3.xmlSchema.boolean, 'boolean'],
      [ns.w3.xmlSchema.date, 'string'],
      [ns.w3.xmlSchema.time, 'string'],
      [ns.w3.xmlSchema.dateTime, 'string'],
      [ns.aml.vocabularies.shapes.dateTimeOnly, 'string'],
      [ns.w3.xmlSchema.string, 'string'],
      [ns.aml.vocabularies.shapes.nil, 'null'],
      [ns.w3.xmlSchema.nil, 'null'],
    ].forEach(([key, expected]) => {
      it(`recognizes a type for ${key}`, () => {
        const result = reader.schemaTypeToJsonDataType(key);
        assert.strictEqual(result,  expected);
      });
    });
  });
});
