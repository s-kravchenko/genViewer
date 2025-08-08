import { FileImportDetails } from '@shared/models';
import { Node, TreeBuilder } from './TreeBuilder';

export interface PositionedNode extends Node {
  children: PositionedNode[];

  gridRow: number;
  gridColumn: number;
  columnSpan: number;
}

export class LayoutManager {
  private fileImport: FileImportDetails;

  private colCounter = 1;
  private nodeMap = new Map<string, PositionedNode>();

  public constructor(fileImport: FileImportDetails) {
    this.fileImport = fileImport;
  }

  public apply(): Map<string, PositionedNode> {
    const treeBuilder = new TreeBuilder(this.fileImport);
    const rootNode = treeBuilder.build();

    if (rootNode)
      this.placeNode(rootNode, 0);

    return this.nodeMap;
  }

  private placeNode(node: Node, generation: number): PositionedNode {
    const children = node.children.map((child) => this.placeNode(child, generation + 1));

    const firstCol = children[0]?.gridColumn ?? this.colCounter;
    const lastCol = children.length
      ? children[children.length - 1].gridColumn + children[children.length - 1].columnSpan - 1
      : this.colCounter;

    if (!children.length) this.colCounter++;

    const positionedNode = {
      ...node,
      children,
      gridRow: generation + 1,
      gridColumn: firstCol,
      columnSpan: lastCol - firstCol + 1,
    };

    this.nodeMap.set(positionedNode.id, positionedNode);

    return positionedNode;
  }
}
