import React from 'react';
import { Connector } from './types';

export default function TreeCanvas({ connectors }: { connectors: Connector[] }) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {connectors.map(({ x1, y1, x2, y2, key }) => (
        <line
          key={key}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#444"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
