import React from 'react';
import { EnergyFlow } from '../../services/geographic/energy-flows';
import { MapRenderingUtils } from '../../utils/geographic/map-rendering';

interface FlowVisualizationProps {
  flows: EnergyFlow[];
  width: number;
  height: number;
}

export const FlowVisualization: React.FC<FlowVisualizationProps> = ({ flows, width, height }) => {
  return (
    <g className="flows">
      {flows.map(flow => {
        const fromPos = MapRenderingUtils.project(flow.from, width, height);
        const toPos = MapRenderingUtils.project(flow.to, width, height);
        const path = MapRenderingUtils.createFlowPath(fromPos, toPos);
        const intensity = MapRenderingUtils.getHeatmapColor(flow.volume / 2000);

        return (
          <g key={flow.id} className="flow-route group cursor-pointer">
            {/* Background glowing line */}
            <path
              d={path}
              fill="none"
              stroke={intensity}
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-10 group-hover:opacity-30 transition-opacity"
            />
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={intensity}
              strokeWidth="1.5"
              strokeDasharray="5,10"
              strokeLinecap="round"
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="100"
                to="0"
                dur={`${5 - (flow.volume / 500)}s`}
                repeatCount="indefinite"
              />
            </path>
            {/* Particles */}
            <circle r="2" fill="white" className="shadow-2xl">
              <animateMotion
                path={path}
                dur={`${5 - (flow.volume / 500)}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </g>
  );
};
