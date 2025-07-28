import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { PositionedNode } from './LayoutManager';

interface Dimensions {
  width: number;
  height: number;
}

const StyledConnectorsLayer = styled.svg<{ $width: number, $height: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
  pointer-events: none;
  z-index: 0;
`;

type ConnectorsLayerProps = {
  treeRef: React.RefObject<HTMLDivElement | null>;
  nodeMap: Map<string, PositionedNode>;
  rowGap: number;
};

export default function ConnectorsLayer({ treeRef, nodeMap, rowGap }: ConnectorsLayerProps) {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [lines, setLines] = useState<string[]>([]);

  // Memoize the update function to prevent unnecessary re-creations
  // This function will be called on initial render, window resize,
  // and when the observed container resizes.
  const updateConnectors = useCallback(() => {
    const container = treeRef.current;
    if (!container) {
      // If container is not available, reset dimensions and lines
      setDimensions({ width: 0, height: 0 });
      setLines([]);
      return;
    }

    setDimensions({
      width: container.getBoundingClientRect().width,
      height: container.getBoundingClientRect().height,
    });

    const connectors: string[] = [];

    for (const parent of nodeMap.values()) {
      const parentEl = document.getElementById(parent.id);
      if (!parentEl) continue;

      const parentRect = parentEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const parentX = parentRect.left + parentRect.width / 2 - containerRect.left + container.scrollLeft;
      const parentY = parentRect.bottom - containerRect.top + container.scrollTop;

      parent.children.forEach((child) => {
        const childData = nodeMap.get(child.id);
        const childEl = document.getElementById(child.id);
        if (!childData || !childEl) return;

        const childRect = childEl.getBoundingClientRect();
        const childX = childRect.left + childRect.width / 2 - containerRect.left + container.scrollLeft;
        const childY = childRect.top - containerRect.top + container.scrollTop;

        const elbow = `
          M${parentX},${parentY}
          V${childY - rowGap / 3}
          H${childX}
          V${childY}
        `;
        connectors.push(elbow);
      });
    }

    setLines(connectors);
  }, [treeRef, nodeMap, rowGap]); // Dependencies for useCallback: re-create if these change

  useEffect(() => {
    // Initial update when component mounts or dependencies change
    updateConnectors();

    const container = treeRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (container) {
      // Create a ResizeObserver to watch for changes in the container's dimensions
      // This is more efficient than window.resize for internal element changes.
      resizeObserver = new ResizeObserver(updateConnectors);
      resizeObserver.observe(container);

      // Add a scroll listener to update connectors when the container is scrolled
      container.addEventListener('scroll', updateConnectors);
    }

    // Add a global window resize listener as a fallback,
    // in case container's dimensions change due to window resize
    // but ResizeObserver doesn't fire (e.g., if container uses fluid units).
    window.addEventListener('resize', updateConnectors);

    // Cleanup function: disconnect observer and remove event listener when component unmounts
    return () => {
      window.removeEventListener('resize', updateConnectors);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (container) {
        container.removeEventListener('scroll', updateConnectors);
      }
    };
  }, [updateConnectors]);

  return (
    <StyledConnectorsLayer $width={dimensions.width} $height={dimensions.height} >
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="#555" fill="none" strokeWidth={2} />
      ))}
    </StyledConnectorsLayer>
  );
}
