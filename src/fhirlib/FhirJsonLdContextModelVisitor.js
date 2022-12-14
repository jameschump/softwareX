const {DefinitionBundleLoader, ModelVisitor, FhirRdfModelGenerator} = require('./FhirRdfModelGenerator');
const Prefixes = require('./Prefixes');
const { StructureError } = require('./errors');

class FhirJsonLdContextModelVisitor extends ModelVisitor {

  static STRUCTURE_DEFN_ROOT = "http://hl7.org/fhir/StructureDefinition/"; // @@ share with FhirRdfModelGenerator

  static HEADER = {
    "@version": 1.1,
    "@vocab": "http://example.com/UNKNOWN#",
  };

  static NAMESPACES = {
    "fhir": "http://hl7.org/fhir/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "owl": "http://www.w3.org/2002/07/owl#",
  }

  static TYPE_AND_INDEX = {
    "resourceType": {
      "@id": "rdf:type",
      "@type": "@id"
    },
    "index": {
      "@id": "fhir:index",
      "@type": "http://www.w3.org/2001/XMLSchema#integer"
    },
  };

  static GEND_CONTEXT_SUFFIX = ".context.jsonld";

  static STEM = "https://fhircat.org/fhir-r4/original/contexts/"; // could be a parameter but convenient to write in one place
  static SUFFIX = ".context.jsonld";

  constructor(definitionLoader, opts) {
    super(definitionLoader);
    this.cache = new Map(); // not used yet
    this.opts = opts;
  }

  async genJsonldContext (resourceDef, config) {
    if (!(resourceDef.id in this.cache)) {
      this.ret = [{
        '@context': Object.assign(
          {},
          FhirJsonLdContextModelVisitor.HEADER,
          FhirJsonLdContextModelVisitor.NAMESPACES,
          FhirJsonLdContextModelVisitor.TYPE_AND_INDEX
        )
      }];
      let baseContext = {};
      if (resourceDef.id !== 'root') { // grumble
        const modelGenerator = new FhirRdfModelGenerator(this.definitionLoader, this.opts);
        if (resourceDef === null) {
          const e = new StructureError(`Key ${target} not found`);
          if ('error' in config)
            config.error(e);
          else
            throw e;
        }
        if ("baseDefinition" in resourceDef) {
          if (!(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
            throw Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`, resourceDef);

          const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
          const base = await this.getBaseContext(recursionTarget, config);
          baseContext = base['@context'];
        }
        await modelGenerator.visitResource(resourceDef, this, config);
        Object.assign(this.ret[0]['@context'], baseContext); // @@ neeeded? or does genJsonldContext leave ret[0] populated...
      }
      this.cache.set(resourceDef.id, this.ret[0]);
    }
    return this.cache.get(resourceDef.id);
  }

  async getBaseContext(recursionTarget, config) {
    const parentDef = await this.definitionLoader.getStructureDefinitionByName(recursionTarget);
    // hide the stack, process parent, restore the stack
    const was = this.ret;
    const base = await this.genJsonldContext(parentDef, config);
    this.ret = was;
    return base;
  }

  async enter (propertyMapping, config) {
    if (!("type" in propertyMapping))
      throw Error(`Expected this to have a type:\n${JSON.stringify(propertyMapping, null, 2)}`)
    if (!(propertyMapping.type.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw Error(`Don't know where to look for base structure ${propertyMapping.type}`, propertyMapping);

    const recursionTarget = propertyMapping.type.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
    const base = await this.getBaseContext(recursionTarget, config);
    const nestedElt = {
      '@id': FhirJsonLdContextModelVisitor.shorten(propertyMapping.predicate),
      '@context': Object.assign({}, base['@context']),
    }
    this.ret[0]["@context"][propertyMapping.property] = nestedElt;
    this.ret.unshift(nestedElt);
  }

  element (propertyMappings, config) {
    propertyMappings.forEach(propertyMapping => {
      if (propertyMapping.isScalar) {
        const id = FhirJsonLdContextModelVisitor.shorten(propertyMapping.predicate);
        // In FHIR Core, this will be either fhir:v or fhir:div
        this.ret[0]["@context"][id === 'fhir:v' ? 'v' : propertyMapping.property] = {
          '@id': id,
          '@type': propertyMapping.type.datatype,
        };
      } else {
        const type = propertyMapping.type.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT)
              ? propertyMapping.type.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length)
              : propertyMapping.type;
        this.ret[0]["@context"][propertyMapping.property] = {
          '@id': FhirJsonLdContextModelVisitor.shorten(propertyMapping.predicate),
          '@context': type + FhirJsonLdContextModelVisitor.GEND_CONTEXT_SUFFIX,
        };
      }
    });
  }

  exit (propertyMapping, config) {
    this.ret.shift();
  }

  static shorten (p) {
    if (p === Prefixes.rdf + 'type')
      return 'rdf:type'
    const pairs = [
      {prefix: 'fhir', ns: Prefixes.fhir},
      {prefix: 'rdf', ns: Prefixes.rdf}
    ]
    return pairs.reduce((acc, pair) => {
      if (!p.startsWith(pair.ns))
        return acc
      const localName = p.substr(pair.ns.length) // .replace(/[a-zA-Z]+\./, '')
      const n = pair.prefix + ':' + escape(localName)
      return acc === null || n.length < acc.length ? n : acc
    }, null)
  }
};

if (typeof module !== 'undefined')
  module.exports = FhirJsonLdContextModelVisitor;
