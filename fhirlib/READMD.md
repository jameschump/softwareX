
## dependencies

* fhri.shex -- FhirJsonLdContextGenerator test, FhirTurtleSerializer
  test

## debugging

### FHIR content models

Input data must conform to content models both for pre-processing and
for serialization. Example debugging steps:

1. download appropriate profiles, e.g. 4.0.1 from
   http://hl7.org/fhir/downloads.html (look for FHIR Defintions\n •
   JSON)

2. download associated examples from same page (look for JSON •
   Examples)

3. avoid confusing by renaming them à la
   FHIR-{definitions,examples}-4.0.1.zip

4. examine content model for suspect Resource
(profiles-resources.json) or Datatype (profiles-types.json) à la:
``` bash
jq '.entry[].resource | select(.id=="Medication") |
.differential.element[] | select(.type) | [.id, (.type[].code)] |
join(" -- ")' profiles-resources.json | less
```
## jq recipes

### extract StructureDefinition

To load a StructureDefinition for e.g. `DomainResource`,

```jq '.entry[] | select(.fullUrl=="http://hl7.org/fhir/StructureDefinition/DomainResource")' profiles-resources.json```
