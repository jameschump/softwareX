/**
 * The JSON-LD Playground example files.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 */
(function($) {
  window.playground = window.playground || {};
  var playground = window.playground;

  // setup the examples and params
  playground.examples = {};
  playground.frames = {};
  playground.contexts = {};

  // add the example of a Patient
  playground.examples["Patient"] =
      {
        "resourceType": "Patient",
        "id": "pat1",
        "text": {
          "status": "generated",
          "div": "<div>…</div>"
        },
        "identifier": [
          {
            "use": "usual",
            "type": {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code": "MR"
                }
              ]
            },
            "system": "urn:oid:0.1.2.3.4.5.6.7",
            "value": "654321"
          }
        ],
        "active": true,
        "name": [
          {
            "use": "official",
            "family": "Donald",
            "given": [
              "Duck"
            ]
          }
        ],
        "gender": "male",
        "photo": [
          {
            "contentType": "image/gif",
            "data": "R0l…AA7"
          }
        ],
        "contact": [
          {
            "relationship": [
              {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
                    "code": "E"
                  }
                ]
              }
            ],
            "organization": {
              "reference": "Organization/1",
              "display": "Walt Disney Corporation"
            }
          }
        ],
        "managingOrganization": {
          "reference": "Organization/1",
          "display": "ACME Healthcare, Inc"
        },
        "link": [
          {
            "other": {
              "reference": "Patient/pat2"
            },
            "type": "seealso"
          }
        ]
      };

  // add the example of a Observation
  playground.examples["Observation"] =
      {
        "resourceType": "Observation",
        "id": "f001",
        "text": {
          "status": "generated",
          "div": "<div>…</div>"
        },
        "identifier": [
          {
            "use": "official",
            "system": "http://www.bmc.nl/zorgportal/identifiers/observations",
            "value": "6323"
          }
        ],
        "status": "final",
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "15074-8",
              "display": "Glucose [Moles/volume] in Blood"
            }
          ]
        },
        "subject": {
          "reference": "Patient/f001",
          "display": "P. van de Heuvel"
        },
        "effectivePeriod": {
          "start": "2013-04-02T09:30:10+01:00"
        },
        "issued": "2013-04-03T15:30:10+01:00",
        "performer": [
          {
            "reference": "Practitioner/f005",
            "display": "A. Langeveld"
          }
        ],
        "valueQuantity": {
          "value": 6.3,
          "unit": "mmol/l",
          "system": "http://unitsofmeasure.org",
          "code": "mmol/L"
        },
        "interpretation": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                "code": "H",
                "display": "High"
              }
            ]
          }
        ],
        "referenceRange": [
          {
            "low": {
              "value": 3.1,
              "unit": "mmol/l",
              "system": "http://unitsofmeasure.org",
              "code": "mmol/L"
            },
            "high": {
              "value": 6.2,
              "unit": "mmol/l",
              "system": "http://unitsofmeasure.org",
              "code": "mmol/L"
            }
          }
        ]
      };

  // add the example of a CodeSystem
  playground.examples["CodeSystem"] =
      {
        "resourceType": "CodeSystem",
        "id": "example",
        "meta": {
          "profile": [
            "http://hl7.org/fhir/StructureDefinition/shareablecodesystem"
          ]
        },
        "text": {
          "status": "generated",
          "div": "<div>…</div>"
        },
        "url": "http://hl7.org/fhir/CodeSystem/example",
        "identifier": [
          {
            "system": "http://acme.com/identifiers/codesystems",
            "value": "internal-cholesterol-inl"
          }
        ],
        "version": "20160128",
        "name": "ACMECholCodesBlood",
        "title": "ACME Codes for Cholesterol in Serum/Plasma",
        "status": "draft",
        "experimental": true,
        "date": "2016-01-28",
        "publisher": "Acme Co",
        "contact": [
          {
            "name": "FHIR project team",
            "telecom": [
              {
                "system": "url",
                "value": "http://hl7.org/fhir"
              }
            ]
          }
        ],
        "description": "This is an example code system that includes all the ACME codes for serum/plasma cholesterol from v2.36.",
        "caseSensitive": true,
        "content": "complete",
        "filter": [
          {
            "code": "acme-plasma",
            "description": "An internal filter used to select codes that are only used with plasma",
            "operator": [
              "="
            ],
            "value": "the value of this filter is either 'true' or 'false'"
          }
        ],
        "concept": [
          {
            "code": "chol-mmol",
            "display": "SChol (mmol/L)",
            "definition": "Serum Cholesterol, in mmol/L",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "From ACME POC Testing"
              }
            ]
          },
          {
            "code": "chol-mass",
            "display": "SChol (mg/L)",
            "definition": "Serum Cholesterol, in mg/L",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "From Paragon Labs"
              }
            ]
          },
          {
            "code": "chol",
            "display": "SChol",
            "definition": "Serum Cholesterol",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "Obdurate Labs uses this with both kinds of units..."
              }
            ]
          }
        ]
      };

  // add the example of a Medication
  playground.examples["Medication"] =
      {
        "resourceType": "Medication",
        "id": "med0301",
        "text": {
          "status": "generated",
          "div": "<div>…</div>"
        },
        "contained": [
          {
            "resourceType": "Organization",
            "id": "org4",
            "name": "Pfizer Laboratories Div Pfizer Inc"
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/ndc",
              "code": "0409-6531-02",
              "display": "Vancomycin Hydrochloride (VANCOMYCIN HYDROCHLORIDE)"
            }
          ]
        },
        "status": "active",
        "manufacturer": {
          "reference": "#org4"
        },
        "doseForm": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "385219001",
              "display": "Injection Solution (qualifier value)"
            }
          ]
        },
        "ingredient": [
          {
            "itemCodeableConcept": {
              "coding": [
                {
                  "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                  "code": "66955",
                  "display": "Vancomycin Hydrochloride"
                }
              ]
            },
            "isActive": true,
            "strengthRatio": {
              "numerator": {
                "value": 500,
                "system": "http://unitsofmeasure.org",
                "code": "mg"
              },
              "denominator": {
                "value": 10,
                "system": "http://unitsofmeasure.org",
                "code": "mL"
              }
            }
          }
        ],
        "batch": {
          "lotNumber": "9494788",
          "expirationDate": "2017-05-22"
        }
      };

  // add the example of a AllergyIntolerance
  playground.examples["AllergyIntolerance"] =
      {
        "resourceType": "AllergyIntolerance",
        "id": "example",
        "text": {
          "status": "generated",
          "div": "<div>…</div>"
        },
        "identifier": [
          {
            "system": "http://acme.com/ids/patients/risks",
            "value": "49476534"
          }
        ],
        "clinicalStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              "code": "active",
              "display": "Active"
            }
          ]
        },
        "verificationStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
              "code": "confirmed",
              "display": "Confirmed"
            }
          ]
        },
        "type": "allergy",
        "category": [
          "food"
        ],
        "criticality": "high",
        "code": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "227493005",
              "display": "Cashew nuts"
            }
          ]
        },
        "patient": {
          "reference": "Patient/example"
        },
        "onsetDateTime": "2004",
        "recordedDate": "2014-10-09T14:58:00+11:00",
        "recorder": {
          "reference": "Practitioner/example"
        },
        "asserter": {
          "reference": "Patient/example"
        },
        "lastOccurrence": "2012-06",
        "note": [
          {
            "text": "The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract."
          }
        ],
        "reaction": [
          {
            "substance": {
              "coding": [
                {
                  "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                  "code": "1160593",
                  "display": "cashew nut allergenic extract Injectable Product"
                }
              ]
            },
            "manifestation": [
              {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "39579001",
                    "display": "Anaphylactic reaction"
                  }
                ]
              }
            ],
            "description": "Challenge Protocol. Severe reaction to subcutaneous cashew extract. Epinephrine administered",
            "onset": "2012-06-12",
            "severity": "severe",
            "exposureRoute": {
              "coding": [
                {
                  "system": "http://snomed.info/sct",
                  "code": "34206005",
                  "display": "Subcutaneous route"
                }
              ]
            }
          },
          {
            "manifestation": [
              {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "64305001",
                    "display": "Urticaria"
                  }
                ]
              }
            ],
            "onset": "2004",
            "severity": "moderate",
            "note": [
              {
                "text": "The patient reports that the onset of urticaria was within 15 minutes of eating cashews."
              }
            ]
          }
        ]
      };

  // add the example of bundle (embedded resourceType)
  playground.examples["Bundle"] =
      {
          "resourceType": "Bundle",
          "id": "bundle-example",
          "meta": {
              "lastUpdated": "2014-08-18T01:43:30Z",
              "tag": [
                  {
                      "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
                      "code": "HTEST",
                      "display": "test health data"
                  }
              ]
          },
          "type": "searchset",
          "total": 3,
          "link": [
              {
                  "relation": "self",
                  "url": "https://example.com/base/MedicationRequest?patient=347&_include=MedicationRequest.medication&_count=2"
              },
              {
                  "relation": "next",
                  "url": "https://example.com/base/MedicationRequest?patient=347&searchId=ff15fd40-ff71-4b48-b366-09c706bed9d0&page=2"
              }
          ],
          "entry": [
              {
                  "fullUrl": "https://example.com/base/MedicationRequest/3123",
                  "resource": {
                      "resourceType": "MedicationRequest",
                      "id": "3123",
                      "text": {
                          "status": "generated",
                          "div": "<div>…</div>"
                      },
                      "status": "unknown",
                      "intent": "order",
                      "medicationReference": {
                          "reference": "Medication/example"
                      },
                      "subject": {
                          "reference": "Patient/347"
                      }
                  },
                  "search": {
                      "mode": "match",
                      "score": 1
                  }
              },
              {
                  "fullUrl": "https://example.com/base/Medication/example",
                  "resource": {
                      "resourceType": "Medication",
                      "id": "example",
                      "text": {
                          "status": "generated",
                          "div": "<div>…</div>"
                      }
                  },
                  "search": {
                      "mode": "include"
                  }
              }
          ]
      };

  // add the example of a Library
  playground.examples["Library"] = {
    "@context": {
      "dc11": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex:contains": {"@type": "@id"}
    },
    "@graph": [{
      "@id": "http://example.org/library",
      "@type": "ex:Library",
      "ex:contains": "http://example.org/library/the-republic"
    }, {
      "@id": "http://example.org/library/the-republic",
      "@type": "ex:Book",
      "dc11:creator": "Plato",
      "dc11:title": "The Republic",
      "ex:contains": "http://example.org/library/the-republic#introduction"
    }, {
      "@id": "http://example.org/library/the-republic#introduction",
      "@type": "ex:Chapter",
      "dc11:description": "An introductory chapter on The Republic.",
      "dc11:title": "The Introduction"
    }]
  };

  // add the frame example of a Library
  playground.frames["Library"] = {
    "@context": {
      "dc11": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#"
    },
    "@type": "ex:Library",
    "ex:contains": {
      "@type": "ex:Book",
      "ex:contains": {"@type": "ex:Chapter"}
    }
  };

  // add an Activity Streams 2.0 Example
  // currently uses the temporary dev location for the context document.
  playground.examples["Activity"] = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "@type": "Create",
    "actor": {
      "@type": "Person",
      "@id": "acct:sally@example.org",
      "name": "Sally"
    },
    "object": {
      "@type": "Note",
      "content": "This is a simple note"
    },
    "published": "2015-01-25T12:34:56Z"
  }

})(jQuery);
