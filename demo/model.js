import pkg from '@api-components/api-model-generator';

/** @typedef {import('@api-components/api-model-generator/types').ApiConfiguration} ApiConfiguration */

/** @type {Map<string, ApiConfiguration>} */
const config = new Map();
config.set('demo-api/demo-api.raml', { type: "RAML 1.0" });
config.set('example-generator-api/example-generator-api.raml', { type: "RAML 1.0" });
config.set('APIC-187/APIC-187.raml', { type: 'RAML 1.0' });
config.set('APIC-188/APIC-188.raml', { type: 'RAML 1.0' });
config.set('APIC-233/APIC-233.raml', { type: 'RAML 0.8' });
config.set('APIC-391/APIC-391.raml', { type: 'RAML 1.0' });
config.set('APIC-487/APIC-487.raml', { type: 'RAML 1.0' });
config.set('APIC-655/APIC-655.raml', { type: 'RAML 1.0' });
config.set('APIC-689/APIC-689.raml', { type: 'RAML 1.0' });
config.set('APIC-690/APIC-690.raml', { type: 'RAML 1.0' });
config.set('SE-13092/SE-13092.raml', { type: 'RAML 1.0' });
config.set('SE-22063/SE-22063.raml', { type: 'RAML 1.0' });
config.set('SE-10469/SE-10469.raml', { type: 'RAML 1.0' });
config.set('tracked-examples/tracked-to-linked.raml', { type: 'RAML 1.0' });

pkg.generate(config);
