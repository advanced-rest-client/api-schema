import pkg from '@api-components/api-model-generator';

/** @typedef {import('@api-components/api-model-generator/types').ApiConfiguration} ApiConfiguration */

/** @type {Map<string, ApiConfiguration>} */
const config = new Map();
config.set('demo-api/demo-api.raml', { type: "RAML 1.0" });

pkg.generate(config);
