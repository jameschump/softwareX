const ShExUtil = require('@shexjs/util');
const Prefixes = require('./Prefixes');
const Ns_fh = 'http://hl7.org/fhir/'
const Ns_fhsh = 'http://hl7.org/fhir/shape/'
const Ns_rdf = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
// const StupidBaseUrl = r => `http://uu3.org/fhir/${r}-R4-jsonld-1.1-context.jsonld`
const StupidBaseUrl = r => `${r}.context.jsonld`;

class FhirJsonLdContextGenerator {

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

  static ROOT = {
    "@context": {
      "fhir": "http://hl7.org/fhir/",
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "dc": "http://purl.org/dc/elements/1.1/",
      "cs": "http://hl7.org/orim/codesystem/",
      "dcterms": "http://purl.org/dc/terms/",
      "dt": "http://hl7.org/orim/datatype/",
      "ex": "http://hl7.org/fhir/StructureDefinition/",
      "fhir-vs": "http://hl7.org/fhir/ValueSet/",
      "loinc": "http://loinc.org/rdf#",
      "os": "http://open-services.net/ns/core#",
      // "rim": "http://hl7.org/orim/class/",
      "rim": "http://hl7.org/owl/rim/",
      "sct": "http://snomed.info/id/",
      "vs": "http://hl7.org/orim/valueset/",
      "w5": "http://hl7.org/fhir/w5#"
    }
  };

  static GEND_CONTEXT_SUFFIX = ".context.jsonld";

  static STEM = "https://fhircat.org/fhir-r4/original/contexts/"; // could be a parameter but convenient to write in one place
  static SUFFIX = ".context.jsonld";

  constructor(shexj, index) {
    this.shexj = shexj;
    this.index = index || shexj._index || ShExUtil.index(shexj);
    this.cache = new Map();
    this.cache.set("root", FhirJsonLdContextGenerator.ROOT);
  }

  genJsonldContext (target, config) {
    if (!this.cache.has(target)) {
      const v = new Converter(this.shexj, config);
      const ret = v.convert(this.index.shapeExprs['http://hl7.org/fhir/shape/' + target], this.index);
      this.cache.set(target, ret);
    }
    return this.cache.get(target);
  }
};

class Converter {
  constructor (schema, config) {
    this.schema = schema;
    this.config = config;
  }

  convert (shexpr, index) {
    const ret = {
      '@context': Object.assign(
          {},
          FhirJsonLdContextGenerator.HEADER,
          FhirJsonLdContextGenerator.NAMESPACES,
          this.visitShapeDecl(shexpr, index)
      ) // this.lookup(from)
    }
    return ret
  }

  lookup (label) {
    const found = this.schema.shapes.find(e => e.id === label)
    if (!found) {
      report(Error(`${label} not found`))
      return null
    }
    return found
  }

  visitShapeDecl (shexpr, index) {
    return this.visitShapeExpr(shexpr.shapeExpr, index);
  }

  visitShapeExpr (shexpr, index) {
    if (typeof shexpr === 'string')
      return this.visitShapeExpr(this.lookup(shexpr), index);

    switch (shexpr.type) {
    case 'Shape':
      return this.visitShape(shexpr, index);
    case 'ShapeOr': {
      return Object.assign.apply(Object, shexpr.shapeExprs.map(junct => this.visitShapeExpr(junct, index)));
    }
    case 'NodeConstraint':
    case 'ShapeNot': return {};
    default: throw Error('what\'s a ' + JSON.stringify(shexpr))
    }
  }

  visitShape (shape, index) {
    const bases = (shape.extends || []).map(extended => {
      const found = this.schema.shapes.find(e => e.id === extended)
      return this.visitShape(found.shapeExpr, index)
    }).concat(
      this.visitTripleExpr(shape.expression, index)
    )
    return Object.assign.apply({}, bases);
  }

  visitTripleExpr (expr, index) {
    switch (expr.type) {
      case 'OneOf':
      case 'EachOf':
        return Object.assign(
            {},
            FhirJsonLdContextGenerator.TYPE_AND_INDEX, // rdf:type, fhir:index, and all of the...
            Object.assign.apply({}, expr.expressions.map(e => this.visitTripleExpr(e, index))) // generated properties
        )
      case 'TripleConstraint':
        const {id, property} = shorten(expr.predicate)
        if (id === 'fhir:nodeRole')
          return {}
        if (id === 'rdf:type')
          return {"resourceType": {"@id": "rdf:type", "@type": "@id"}}
        const ret = {}
        ret[property] = {'@id': id}
        if ("max" in expr && expr.max !== 1 && this.config.axes.c)
          ret[property]["@container"] = "@list"
        if (typeof expr.valueExpr === "string") {
          if (false && expr.valueExpr.substr(Ns_fhsh.length).match(/\./)) { // would need cycle detection, currently left up to
            // '.'d reference to a nested Shape, e.g. `fhirs:Patient.contact`
            ret[property]['@context'] = this.visitTripleExpr(this.lookup(expr.valueExpr).expression)
          } else {
            // all other references (Datatypes, Resources)
            const firstRef = this.findFirstOfCollection(expr.valueExpr, index)
            ret[property]['@context'] = StupidBaseUrl(firstRef.substr(Ns_fhsh.length).replace(/OneOrMore_/, ''))
          }
        } else if (typeof expr.valueExpr === 'object') {
          const a = (expr.annotations || []).find(a => a.predicate === "http://shex2json.example/map#property")
          if (a) {
            ; // no need for an @type
          } else if (expr.valueExpr.type === "NodeConstraint") {
            if (expr.valueExpr.nodeKind === 'iri') {
              // e.g. `fhir:link IRI`
              ret[property]['@type'] = "@id"
            } else if ("datatype" in expr.valueExpr) {
              // e.g. `fhir:v xsd:string`
              ret[property]['@type'] = expr.valueExpr.datatype
            }
          } else if (expr.valueExpr.type === "Shape") {
            ret[property]['@context'] = this.visitShape(expr.valueExpr)
          } else if (expr.valueExpr.type === "ShapeOr"
                     && !(expr.valueExpr.shapeExprs.find(v => typeof v !== "string"
                                                         || !v.startsWith(Ns_fhsh))) /* all refs */) {
            /* Observation.value -> { valueAttachment: {@id: 'fhir:v', @context: 'Attachment.context.jsonld'},
                                      valueBoolean: {@id: 'fhir:v', @context: 'boolean.context.jsonld'} }
             */
            delete ret[property]; // N/A for curried names.
            expr.valueExpr.shapeExprs.forEach(v => {
              const type = v.substr(Ns_fhsh.length)
              const curriedPredicate = property
                    + type.substr(0, 1).toUpperCase() // capitolize this letter
                    + type.substr(1)
              /*
                !! not tested with list. current resources and types have no polymorphic property with max card > 1 per this query:
                jq '.entry[].resource.differential.element[]? | select((.id | endswith("[x]")) and .max != "1")' profiles-resources.json
               */
              ret[curriedPredicate] = {
                '@id': id,
                '@context': StupidBaseUrl(type/*.replace(/OneOrMore_/, '')*/)
              }
            })
          } else {
            // e.g. `fhir:gender @fhirs:code AND { fhir:v @fhirvs:adminstritative-gender }`
            const ref = firstRef(expr.valueExpr);
            if (ref) {
              // TODO: why isn't this need here like it is above?: this.findFirstOfCollection(ref, index);
              ret[property]['@context'] = StupidBaseUrl(ref.substr(Ns_fhsh.length).replace(/OneOrMore_/, ''))
            }
          }
        }
        return ret
      default:
        throw Error('what\'s a ' + JSON.stringify(expr))
    }
  }

  findFirstOfCollection (label, index) {
    if (!label.substr(Ns_fhsh.length).startsWith('OneOrMore_'))
      return label;
    const valueExpr = index.shapeExprs[label].expression.expressions[0].valueExpr;
    return firstRef(valueExpr);
  }
}

function firstRef (expr) {
  if (typeof expr === "string")
    return expr;
  if (["ShapeOr", "ShapeAnd"].indexOf(expr.type) !== -1)
    return expr.shapeExprs.find(firstRef)
  return null // nothing found
}

function shorten (p) {
  if (p === Ns_rdf + 'type')
    return {id: 'rdf:type', attr: 'resourceType'}
  const pairs = [
    {prefix: 'fhir', ns: Ns_fh},
    {prefix: 'rdf', ns: Ns_rdf},
  ]
  return pairs.reduce((acc, pair) => {
    if (!p.startsWith(pair.ns))
      return acc
    const localName = p.substr(pair.ns.length) // .replace(/[a-zA-Z]+\./, '')
    const lastDot = localName.lastIndexOf('.'); // may be -1
    const property = localName.substr(lastDot + 1);
    const n = pair.prefix + ':' + escape(localName)
    return acc.id === null || n.length < acc.id.length ? {id: n, property} : acc
  }, {id: null, attr: null})
}

function escape (localName) {
  return localName
}

if (typeof module !== 'undefined')
  module.exports = FhirJsonLdContextGenerator;
