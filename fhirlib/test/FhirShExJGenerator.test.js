const Fs = require('fs');
const Path = require('path');
const FhirShExJGenerator = require('../FhirShExJGenerator.js');

const GEN_SHEXJ_CONTEXT_CONFIG = {
  addValueSetVersionAnnotation: false, // handle e.g. "http://hl7.org/fhir/ValueSet/medicationrequest-status|4.6.0"
  oloIndexes: true,
};

const SKIP = ['BackboneElement', 'base', 'DomainResource', 'Element', 'integer', 'BackboneType', 'DataType', 'PrimitiveType'];

const GenTests = [
  {resources: 'fhir/medreq-min-resources.json', datatypes: 'fhir/medreq-min-types.json', valuesets: 'fhir/medreq-min-valuesets.json', skip: SKIP, expected: 'fhir/medreq-min-expected.shexj', got: 'fhir/medreq-min-got.shexj'}
].map(t => {
  (["resources", "datatypes", "valuesets", "expected", "got"]).forEach(attr => {
    t[attr + "Rel"] = Path.relative(process.env.PWD, Path.join(__dirname, t[attr]));
  });
  return t;
});

// test('generate $ expected from $ resources and $ datatypes', async () => {const {resources, datatypes, skip, expected, got} = GenTests[0];
test.each(GenTests)('generate $expectedRel from $resourcesRel and $datatypesRel', async ({resources, datatypes, valuesets, skip, expected, got, expectedRel, resourcesRel, datatypesRel}) => {
  // Generate in memory
  // const generator = new FhirShExJGenerator(FHIRStructureMap, FHIRDatatypeMap);
  const parsedResources = await readJsonProfile(Path.join(__dirname, resources));
  const parsedDatatypes = await readJsonProfile(Path.join(__dirname, datatypes));
  const parsedValuesets = await readJsonProfile(Path.join(__dirname, valuesets));
  const generator = new FhirShExJGenerator(
      parsedResources,
      parsedDatatypes,
      parsedValuesets,
      GEN_SHEXJ_CONTEXT_CONFIG
  );
  const generated = generator.genShExJ(skip);

  // Verify generated size
  // expect(generated.shapes.map(s => s.id.startsWith(Prefixes.fhirshex) ? s.id.substr(Prefixes.fhirshex.length) : s.id.substr(Prefixes.fhirvs.length))).toEqual(expect.arrayContaining(generated));

  await writeShExJ(Path.join(__dirname, got), generated, false); // TODO: change to true for production

  // Parse it back
  const json = await Fs.promises.readFile(Path.join(__dirname, expected), 'utf8');
  const reference = JSON.parse(json);

  // Verify read size
  expect(generated.shapes.map(se => se.id)).toEqual(reference.shapes.map(se => se.id));
  // console.log(JSON.stringify(generated, null, 2));
  expect(generated).toEqual(reference);
});

// Write to disk with long-lines
async function writeShExJ(filename, schema, longLines) {
  const head = `{
  "type": "Schema",
  "shapes": [
`;
  const tail = `  ],
  "@context": "http://www.w3.org/ns/shex.jsonld"
}
`;
  await Fs.promises.writeFile(
      filename,
      longLines
          ? head + schema.shapes.map((se, idx) => JSON.stringify(se) + (idx === schema.shapes.length - 1 ? '' : ',') + '\n').join('') + tail
          : JSON.stringify(schema, null, 2)
  );
}

async function readJsonProfile (path) {
  const text = await Fs.promises.readFile(path, 'utf8');
  const obj = JSON.parse(text);
  return obj;
}
