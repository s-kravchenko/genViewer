import { useEffect, useState, useRef } from 'react';
import { Tree, Person } from '@shared/models';
import { groupByGeneration, findRoot } from './TreeLayout';
import { TreeContainer, GenerationRow, PersonBox, PersonWrapper } from './Styled';
import TreeCanvas from './TreeCanvas';
import { Connector, PersonWithGen } from './types';

type DescendantTreeProps = {
  treeId?: string;
};

export function DescendantTree({ treeId }: DescendantTreeProps) {
  const [tree, setTree] = useState<Tree | null>(null);
  const [generations, setGenerations] = useState<PersonWithGen[][] | null>(null);
  const boxRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    if (!treeId) return;

    fetch(`/api/tree/${treeId}`)
      .then((res) => res.json())
      .then((t: Tree) => {
        setTree(t);
        const root = findRoot(t);
        setGenerations(groupByGeneration(root, t));
      });
  }, [treeId]);

  useEffect(() => {
    const newConnectors: Connector[] = [];
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || !tree) return;

    for (const family of tree.families ?? []) {
      const { husbandId, wifeId, childIds = [] } = family;
      const parents = [husbandId, wifeId].filter(Boolean);

      for (const parentId of parents) {
        const parentBox = boxRefs.current.get(parentId!);
        if (!parentBox) continue;
        const parentRect = parentBox.getBoundingClientRect();

        for (const childId of childIds) {
          const childBox = boxRefs.current.get(childId!);
          if (!childBox) continue;
          const childRect = childBox.getBoundingClientRect();

          const x1 = parentRect.left + parentRect.width / 2 - containerRect.left;
          const y1 = parentRect.bottom - containerRect.top;
          const x2 = childRect.left + childRect.width / 2 - containerRect.left;
          const y2 = childRect.top - containerRect.top;

          newConnectors.push({ x1, y1, x2, y2, key: `${parentId}-${childId}` });
        }
      }
    }

    setConnectors(newConnectors);
  }, [tree]);

  return (
    <TreeContainer ref={containerRef}>
      <TreeCanvas connectors={connectors} />
      {generations?.map((gen, i) => (
        <GenerationRow key={i}>
          {gen.map((person) => (
            <PersonWrapper
              key={person.id}
              ref={(el) => {
                if (el) boxRefs.current.set(person.id, el);
              }}
            >
              <PersonBox sex={person.sex}>
                <div>
                  {person.givenName} {person.surname}
                </div>
                {(person.birthDate || person.deathDate) &&
                  <div>
                    ({person.birthDate || '?'} - {person.deathDate || '?'})
                  </div>
                }
              </PersonBox>
            </PersonWrapper>
          ))}
        </GenerationRow>
      ))}
    </TreeContainer>
  );
}
