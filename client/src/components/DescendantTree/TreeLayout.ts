import { Tree, Person } from '@shared/models';
import { PersonWithGen } from './types';

export function findRoot(tree: Tree): Person | null {
  // Finds a person who is not a child in any family, thus likely the oldest ancestor
  const allChildIds = new Set(tree.families.flatMap((f) => f.childIds ?? []));
  return tree.people.find((p) => !allChildIds.has(p.id)) ?? null;
}

export function groupByGeneration(root: Person | null, tree: Tree): PersonWithGen[][] {
  const personGenerations = new Map<string, number>(); // Stores the determined generation for each person
  const queue: Person[] = []; // Queue for BFS traversal

  if (!root) return [];

  // Initialize with the root person at generation 0
  personGenerations.set(root.id, 0);
  queue.push(root);

  let head = 0; // Use a head pointer for the queue for better performance in JavaScript arrays
  while (head < queue.length) {
    const currentPerson = queue[head++]; // Dequeue the current person
    const currentPersonGen = personGenerations.get(currentPerson.id)!; // Get their assigned generation

    // Find all families where the currentPerson is a parent
    const familiesAsParent = tree.families.filter(
      (f) => f.husbandId === currentPerson.id || f.wifeId === currentPerson.id,
    );

    familiesAsParent.forEach((family) => {
      (family.childIds ?? []).forEach((childId) => {
        const child = tree.people.find((p) => p.id === childId);
        if (!child) return;

        // --- Core Logic for Child Generation ---
        // Identify all parents of this child within this specific family
        const parentsInFamily = [family.husbandId, family.wifeId].filter(Boolean);

        let maxParentGen = -1; // Initialize with a value lower than any possible generation

        // Find the maximum generation among the child's parents (if their generations are already set)
        parentsInFamily.forEach((parentId) => {
          if (personGenerations.has(parentId!)) {
            maxParentGen = Math.max(maxParentGen, personGenerations.get(parentId!)!);
          }
        });

        // Calculate the potential generation for the child based on the *youngest* parent found so far
        // If no parent's generation is yet determined (e.g., this is the first parent processed for this child),
        // default to currentPersonGen + 1. Otherwise, use maxParentGen + 1.
        const potentialChildGen = (maxParentGen !== -1 ? maxParentGen : currentPersonGen) + 1;

        // If the child's generation hasn't been set yet, or if this newly calculated generation
        // is higher (meaning the child is 'younger' or derived from a younger parent), update it.
        // This handles cases where a child might have parents from different generations.
        if (
          !personGenerations.has(child.id) ||
          potentialChildGen > personGenerations.get(child.id)!
        ) {
          personGenerations.set(child.id, potentialChildGen);
          queue.push(child); // Add child to the queue to process its descendants
        }
      });
    });
  }

  // Convert the map of person IDs to their generations into the desired PersonWithGen[][] format
  const result: PersonWithGen[][] = [];
  personGenerations.forEach((gen, personId) => {
    const person = tree.people.find((p) => p.id === personId);
    if (person) {
      if (!result[gen]) result[gen] = [];
      result[gen].push({ ...person, generation: gen });
    }
  });

  // Sort people within each generation for consistent rendering order (e.g., by ID)
  result.forEach((genArray) => genArray.sort((a, b) => a.id.localeCompare(b.id)));

  return result;
}
