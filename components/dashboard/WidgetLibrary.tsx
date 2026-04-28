import React, { useState } from "react";
import { Widget } from "./Dashboard";

interface WidgetLibraryProps {
  availableWidgets: Widget[];
  onAddWidget: (widget: Widget) => void;
}

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  availableWidgets,
  onAddWidget,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Widget
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <h4 className="font-semibold mb-2">Available Widgets</h4>
            {availableWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => {
                  onAddWidget(widget);
                  setIsOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-gray-100 rounded"
              >
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
