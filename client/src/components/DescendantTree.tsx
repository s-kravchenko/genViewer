import { useEffect, useState } from 'react';
import { Tree } from '@shared/models/Tree';

type DescendantTreeProps = {
  treeId?: string;
};

export default function DescendantTree({ treeId }: DescendantTreeProps) {
  const [tree, setTree] = useState<Tree>();

  useEffect(() => {
    console.log(`DescendantTree treeId: ${treeId}`);
    if (!treeId) return; // Do nothing if treeId is null or undefined

    fetch(`/api/tree/${treeId}`)
      .then((res) => res.json())
      .then(setTree);
  }, [treeId]);

  return (
    <div>
      <div>Tree: {tree?.id}</div>
      <div>People: {tree?.people?.length}</div>
      <ul>
        {tree?.people.map((p, i) => (
          <li key={i}>{p.surname}</li>
        ))}
      </ul>
    </div>
  );
}
