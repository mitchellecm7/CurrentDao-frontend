import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { WidgetLibrary } from "./WidgetLibrary";
import { PortfolioWidget } from "./widgets/PortfolioWidget";
import { TreasuryWidget } from "./widgets/TreasuryWidget";
import { CommunityWidget } from "./widgets/CommunityWidget";
import { AnalyticsWidget } from "./widgets/AnalyticsWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface Widget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

const availableWidgets: Widget[] = [
  {
    id: "portfolio",
    type: "portfolio",
    title: "Portfolio",
    component: PortfolioWidget,
  },
  {
    id: "treasury",
    type: "treasury",
    title: "Treasury",
    component: TreasuryWidget,
  },
  {
    id: "community",
    type: "community",
    title: "Community",
    component: CommunityWidget,
  },
  {
    id: "analytics",
    type: "analytics",
    title: "Analytics",
    component: AnalyticsWidget,
  },
];

const defaultLayout: LayoutItem[] = [
  { i: "portfolio", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
  { i: "treasury", x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 2 },
];

const Dashboard: React.FC = () => {
  const [layout, setLayout] = useState<LayoutItem[]>(defaultLayout);
  const [widgets, setWidgets] = useState<Widget[]>(
    availableWidgets.slice(0, 2),
  ); // Start with first two

  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboardLayout");
    const savedWidgets = localStorage.getItem("dashboardWidgets");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    }
    if (savedWidgets) {
      const widgetIds = JSON.parse(savedWidgets);
      setWidgets(availableWidgets.filter((w) => widgetIds.includes(w.id)));
    }
  }, []);

  const saveLayout = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    localStorage.setItem("dashboardLayout", JSON.stringify(newLayout));
  };

  const addWidget = (widget: Widget) => {
    if (!widgets.find((w) => w.id === widget.id)) {
      const newWidgets = [...widgets, widget];
      setWidgets(newWidgets);
      localStorage.setItem(
        "dashboardWidgets",
        JSON.stringify(newWidgets.map((w) => w.id)),
      );
      // Add to layout
      const newLayoutItem: LayoutItem = {
        i: widget.id,
        x: (layout.length * 6) % 12,
        y: Math.floor(layout.length / 2) * 4,
        w: 6,
        h: 4,
        minW: 3,
        minH: 2,
      };
      const newLayout = [...layout, newLayoutItem];
      saveLayout(newLayout);
    }
  };

  const removeWidget = (widgetId: string) => {
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(newWidgets);
    localStorage.setItem(
      "dashboardWidgets",
      JSON.stringify(newWidgets.map((w) => w.id)),
    );
    const newLayout = layout.filter((l) => l.i !== widgetId);
    saveLayout(newLayout);
  };

  const resetToDefault = () => {
    setLayout(defaultLayout);
    setWidgets(availableWidgets.slice(0, 2));
    localStorage.setItem("dashboardLayout", JSON.stringify(defaultLayout));
    localStorage.setItem(
      "dashboardWidgets",
      JSON.stringify(["portfolio", "treasury"]),
    );
  };

  const renderWidget = (widget: Widget) => {
    const Component = widget.component;
    return (
      <div key={widget.id} className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">{widget.title}</h3>
          <button
            onClick={() => removeWidget(widget.id)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
        <Component />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Personalized Dashboard</h1>
        <div className="flex gap-2">
          <WidgetLibrary
            availableWidgets={availableWidgets}
            onAddWidget={addWidget}
          />
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset to Default
          </button>
        </div>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout, md: layout, sm: layout, xs: layout }}
        onLayoutChange={(currentLayout) => saveLayout(currentLayout)}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={100}
        isDraggable
        isResizable
      >
        {widgets.map((widget) => (
          <div key={widget.id}>{renderWidget(widget)}</div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
