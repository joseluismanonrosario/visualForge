import { CanvasNode, DropPosition } from '../types';

export function findNodeInTree(nodes: CanvasNode[], id: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParentNode(
  nodes: CanvasNode[],
  childId: string,
  parent: CanvasNode | null = null
): { parent: CanvasNode | null; index: number } {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === childId) {
      return { parent, index: i };
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      const result = findParentNode(nodes[i].children, childId, nodes[i]);
      if (result.index !== -1) return result;
    }
  }
  return { parent: null, index: -1 };
}

export function mutateNodeInTree(
  nodes: CanvasNode[],
  id: string,
  updateFn: (node: CanvasNode) => CanvasNode
): CanvasNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return updateFn({ ...node });
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: mutateNodeInTree(node.children, id, updateFn),
      };
    }
    return node;
  });
}

export function deleteNodeInTree(nodes: CanvasNode[], id: string): CanvasNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteNodeInTree(node.children, id),
        };
      }
      return node;
    });
}

export function insertChildInTree(
  nodes: CanvasNode[],
  targetParentId: string,
  newNode: CanvasNode
): CanvasNode[] {
  return nodes.map((node) => {
    if (node.id === targetParentId) {
      return {
        ...node,
        children: [...node.children, newNode],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: insertChildInTree(node.children, targetParentId, newNode),
      };
    }
    return node;
  });
}

export function insertNodeRelative(
  tree: CanvasNode[],
  targetId: string,
  nodeToInsert: CanvasNode,
  position: DropPosition
): CanvasNode[] {
  // Check if target is in the root list
  const rootIndex = tree.findIndex((n) => n.id === targetId);
  if (rootIndex !== -1) {
    if (position === 'inside') {
      const target = tree[rootIndex];
      if (target.isContainer) {
        return tree.map((n, i) =>
          i === rootIndex ? { ...n, children: [...n.children, nodeToInsert] } : n
        );
      }
      // If not container, insert after
      const newTree = [...tree];
      newTree.splice(rootIndex + 1, 0, nodeToInsert);
      return newTree;
    }

    const newTree = [...tree];
    const insertIdx = position === 'before' ? rootIndex : rootIndex + 1;
    newTree.splice(insertIdx, 0, nodeToInsert);
    return newTree;
  }

  // Target is nested inside children
  return tree.map((node) => {
    if (node.id === targetId && position === 'inside') {
      if (node.isContainer) {
        return {
          ...node,
          children: [...node.children, nodeToInsert],
        };
      }
    }

    if (node.children && node.children.length > 0) {
      const childIdx = node.children.findIndex((c) => c.id === targetId);
      if (childIdx !== -1) {
        if (position === 'inside') {
          const childNode = node.children[childIdx];
          if (childNode.isContainer) {
            const updatedChildren = node.children.map((c, i) =>
              i === childIdx ? { ...c, children: [...c.children, nodeToInsert] } : c
            );
            return { ...node, children: updatedChildren };
          }
          // fallback insert after
          const updatedChildren = [...node.children];
          updatedChildren.splice(childIdx + 1, 0, nodeToInsert);
          return { ...node, children: updatedChildren };
        }

        const updatedChildren = [...node.children];
        const insertIdx = position === 'before' ? childIdx : childIdx + 1;
        updatedChildren.splice(insertIdx, 0, nodeToInsert);
        return { ...node, children: updatedChildren };
      }

      return {
        ...node,
        children: insertNodeRelative(node.children, targetId, nodeToInsert, position),
      };
    }

    return node;
  });
}

export function moveNodeSibling(
  nodes: CanvasNode[],
  targetId: string,
  direction: 'up' | 'down'
): CanvasNode[] {
  const index = nodes.findIndex((n) => n.id === targetId);
  if (index !== -1) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= nodes.length) return nodes;
    const newNodes = [...nodes];
    const [moved] = newNodes.splice(index, 1);
    newNodes.splice(newIndex, 0, moved);
    return newNodes;
  }

  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: moveNodeSibling(node.children, targetId, direction),
      };
    }
    return node;
  });
}

export function cloneNodeWithNewIds(node: CanvasNode): CanvasNode {
  const newId = `${node.type}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    ...node,
    id: newId,
    name: `${node.name} (Copy)`,
    children: (node.children || []).map(cloneNodeWithNewIds),
  };
}

export function instantiateNodeWithFreshIds(node: CanvasNode): CanvasNode {
  const newId = `${node.type}_${Math.random().toString(36).substring(2, 9)}`;
  return {
    ...node,
    id: newId,
    name: node.name,
    children: (node.children || []).map(instantiateNodeWithFreshIds),
  };
}

export function reorderNodeInTree(
  nodes: CanvasNode[],
  draggedId: string,
  targetId: string,
  position: DropPosition
): CanvasNode[] {
  if (draggedId === targetId) return nodes;

  const nodeToMove = findNodeInTree(nodes, draggedId);
  if (!nodeToMove) return nodes;

  // Prevent dragging a parent into one of its own descendants
  if (findNodeInTree([nodeToMove], targetId)) {
    return nodes;
  }

  const cleanTree = deleteNodeInTree(nodes, draggedId);
  return insertNodeRelative(cleanTree, targetId, nodeToMove, position);
}
