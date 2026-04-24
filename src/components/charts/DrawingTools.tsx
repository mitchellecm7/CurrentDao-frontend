import React, { useState, useRef, useEffect } from 'react';
import { DrawingTool, DrawingTool as DrawingToolType } from '@/types/charts';
import { Line, Square, Circle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DrawingToolsProps {
  onToolSelect: (tool: DrawingToolType['type'] | null) => void;
  selectedTool: DrawingToolType['type'] | null;
  onDrawingComplete: (drawing: DrawingTool) => void;
  drawings: DrawingTool[];
  onDrawingUpdate: (drawingId: string, updates: Partial<DrawingTool>) => void;
  onDrawingDelete: (drawingId: string) => void;
  disabled?: boolean;
  className?: string;
}

const drawingTools = [
  { type: 'trendline' as const, icon: Line, label: 'Trend Line', color: 'text-blue-600' },
  { type: 'support' as const, icon: TrendingUp, label: 'Support', color: 'text-green-600' },
  { type: 'resistance' as const, icon: TrendingDown, label: 'Resistance', color: 'text-red-600' },
  { type: 'rectangle' as const, icon: Square, label: 'Rectangle', color: 'text-purple-600' },
  { type: 'circle' as const, icon: Circle, label: 'Circle', color: 'text-orange-600' },
];

const colors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#000000'
];

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  onToolSelect,
  selectedTool,
  onDrawingComplete,
  drawings,
  onDrawingUpdate,
  onDrawingDelete,
  disabled = false,
  className = '',
}) => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Partial<DrawingTool> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleToolClick = (toolType: DrawingToolType['type'] | null) => {
    if (disabled) return;
    
    if (selectedTool === toolType) {
      onToolSelect(null);
      setIsDrawing(false);
      setCurrentDrawing(null);
    } else {
      onToolSelect(toolType);
      setIsDrawing(false);
      setCurrentDrawing(null);
    }
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedTool || disabled || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentDrawing({
      id: `drawing-${Date.now()}`,
      type: selectedTool,
      startPoint: { x, y },
      color: selectedColor,
      strokeWidth,
      visible: true,
    });
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentDrawing || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDrawing(prev => prev ? { ...prev, endPoint: { x, y } } : null);
  };

  const handleSvgMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;

    const completeDrawing: DrawingTool = {
      id: currentDrawing.id!,
      type: currentDrawing.type!,
      startPoint: currentDrawing.startPoint!,
      endPoint: currentDrawing.endPoint || currentDrawing.startPoint!,
      color: currentDrawing.color,
      strokeWidth: currentDrawing.strokeWidth || 2,
      visible: true,
    };

    onDrawingComplete(completeDrawing);
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  const renderDrawing = (drawing: DrawingTool | Partial<DrawingTool>) => {
    if (!drawing.startPoint) return null;

    const { startPoint, endPoint = startPoint, color, strokeWidth: width = 2 } = drawing;

    switch (drawing.type) {
      case 'trendline':
      case 'support':
      case 'resistance':
        return (
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={drawing.type === 'support' ? '5,5' : drawing.type === 'resistance' ? '10,5' : '0'}
            opacity={0.8}
          />
        );

      case 'rectangle':
        const widthRect = Math.abs(endPoint.x - startPoint.x);
        const heightRect = Math.abs(endPoint.y - startPoint.y);
        const xRect = Math.min(startPoint.x, endPoint.x);
        const yRect = Math.min(startPoint.y, endPoint.y);
        
        return (
          <rect
            x={xRect}
            y={yRect}
            width={widthRect}
            height={heightRect}
            stroke={color}
            strokeWidth={width}
            fill="none"
            opacity={0.8}
          />
        );

      case 'circle':
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
        );
        
        return (
          <circle
            cx={startPoint.x}
            cy={startPoint.y}
            r={radius}
            stroke={color}
            strokeWidth={width}
            fill="none"
            opacity={0.8}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          {drawingTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.type}
                onClick={() => handleToolClick(tool.type)}
                disabled={disabled}
                title={tool.label}
                className={`
                  p-2 rounded-md transition-all duration-200
                  ${selectedTool === tool.type
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon size={18} />
              </button>
            );
          })}
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          <button
            onClick={() => handleToolClick(null)}
            disabled={disabled}
            title="Clear Drawing"
            className={`
              p-2 rounded-md transition-all duration-200
              ${!selectedTool
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <Minus size={18} />
          </button>
        </div>
      </div>

      {selectedTool && (
        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={disabled}
                  className={`
                    w-6 h-6 rounded-full border-2 transition-all duration-200
                    ${selectedColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Width:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              disabled={disabled}
              className="w-20"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{strokeWidth}</span>
          </div>
        </div>
      )}

      <div className="relative">
        <svg
          ref={svgRef}
          className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 cursor-crosshair"
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
        >
          {drawings.map((drawing) => (
            <g key={drawing.id}>
              {renderDrawing(drawing)}
            </g>
          ))}
          
          {currentDrawing && renderDrawing(currentDrawing)}
        </svg>
      </div>

      {drawings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Drawings</h4>
          <div className="space-y-1">
            {drawings.map((drawing) => (
              <div
                key={drawing.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: drawing.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {drawing.type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onDrawingUpdate(drawing.id, { visible: !drawing.visible })}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    {drawing.visible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => onDrawingDelete(drawing.id)}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingTools;
