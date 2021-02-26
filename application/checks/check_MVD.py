import ifcopenshell
from ifcopenshell.mvd import mvd

ifc_fn = "./ifc-python-parser/files/AC20-FZK-Haus.ifc"
ifc_file = ifcopenshell.open(ifc_fn)

mvd_fn = "./ifcopenshell/mvd/mvd_examples/officials/ReferenceView_V1-2.mvdxml"
mvd_concept_roots = ifcopenshell.mvd.concept_root.parse(mvd_fn)

for concept_root in mvd_concept_roots:
    print(" ",concept_root)
    entity_type = concept_root.entity
    if len(ifc_file.by_type(entity_type)):
        entity_instances = ifc_file.by_type(entity_type)

        for concept in concept_root.concepts():
            print("   ", concept.template())
            for rule in concept.template().rules:
                print("     ", rule)
                for e in entity_instances:
                    extraction = mvd.extract_data(rule,e)
                    print(extraction)


           