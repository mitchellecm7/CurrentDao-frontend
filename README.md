# Geographic Location-Based Trading Interface

A comprehensive energy trading platform with interactive maps, location-based filtering, and regional market analysis built with React, TypeScript, and Leaflet.

## Features

### 🗺️ Interactive Map Integration
- **Real-time map rendering** with 1000+ marker support
- **Custom markers** for energy listings, user location, and regional data
- **Clustering** for performance optimization at low zoom levels
- **Smooth pan and zoom** interactions
- **Mobile-responsive** map controls

### 📍 Location-Based Filtering
- **Radius filtering** - Find listings within X km of a location
- **Regional filtering** - Filter by US regions (Northeast, Southeast, Midwest, Southwest, West)
- **Grid zone filtering** - Filter by electrical grid zones (PJM, ERCOT, CAISO, NYISO, ISO-NE)
- **User location integration** - Automatic GPS positioning
- **Custom coordinate input** - Manual lat/lng entry support

### 📊 Regional Market Analysis
- **Market overview** with aggregated statistics
- **Price trends** (up/down/stable) visualization
- **Regional comparisons** with sorting options
- **Real-time updates** with last refresh timestamps
- **Capacity and listing counts** per region

### 📏 Distance Calculator
- **Route planning** between any two points
- **Delivery cost calculations** based on distance
- **Estimated delivery time** calculations
- **Multiple route management**
- **Export functionality** for route data

### 🔥 Geographic Heat Maps
- **Trading activity visualization** with intensity gradients
- **Multiple data modes** (energy volume, price levels, capacity)
- **Adjustable intensity settings** (low/medium/high)
- **Interactive hotspots** with detailed information
- **Export capabilities** for heat map data

### 🎯 GPS Integration
- **Automatic location detection**
- **Permission handling** with user-friendly prompts
- **Location accuracy indicators**
- **Background location tracking**
- **Privacy-conscious** implementation

## Architecture

### Project Structure
```
src/
├── components/maps/          # Map components
│   ├── InteractiveMap.tsx    # Main interactive map
│   ├── LocationFilter.tsx    # Location filtering UI
│   ├── RegionalMarket.tsx    # Regional market analysis
│   ├── DistanceCalculator.tsx # Distance calculation tool
│   └── HeatMap.tsx          # Heat map visualization
├── hooks/                   # Custom React hooks
│   ├── useGeolocation.ts    # GPS functionality
│   └── useMapIntegration.ts # Map state management
├── utils/                   # Utility functions
│   └── mapHelpers.ts        # Map calculation helpers
├── types/                   # TypeScript definitions
│   └── maps.ts              # Map-related types
└── App.tsx                  # Main application component
```

### Key Technologies
- **React 18** with TypeScript
- **Leaflet** for interactive mapping
- **React-Leaflet** for React integration
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Performance Features

### 🚀 Optimized for 1000+ Markers
- **Marker clustering** at low zoom levels
- **Viewport-based rendering** - only visible markers
- **Debounced map events** to prevent excessive re-renders
- **Memoized calculations** for expensive operations
- **Lazy loading** of map components

### 📱 Mobile Optimization
- **Touch-friendly** controls and interactions
- **Responsive design** for all screen sizes
- **Optimized performance** for mobile devices
- **Gesture support** for map navigation

### ♿ Accessibility
- **WCAG 2.1 compliant** design
- **Keyboard navigation** support
- **Screen reader** compatibility
- **ARIA labels** and descriptions
- **Focus management** for interactive elements

### 🔒 Privacy & Security
- **User-controlled** location permissions
- **No location data storage** without consent
- **Encrypted data transmission**
- **Privacy-conscious** default settings

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yourbigmike/CurrentDao-frontend.git
   cd CurrentDao-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

The build will be created in the `build/` directory.

## Usage

### Basic Navigation
1. **Interactive Map Tab** - View and interact with energy listings on the map
2. **Regional Markets Tab** - Analyze market data by region
3. **Distance Calculator Tab** - Calculate delivery costs and routes
4. **Heat Map Tab** - Visualize trading activity patterns

### Location Filtering
1. Click **"Add Filter"** in the sidebar
2. Choose filter type: **Radius**, **Region**, or **Grid Zone**
3. Configure filter parameters
4. View filtered results on the map

### GPS Features
1. Click **"Enable Location"** in the header
2. Allow browser location access when prompted
3. View your location on the map
4. Use location for distance calculations

### Map Interactions
- **Click markers** to view listing details
- **Drag to pan** the map view
- **Scroll to zoom** in/out
- **Click cluster markers** to zoom into areas
- **Use +/- buttons** for zoom control

## Configuration

### Map Settings
```typescript
const mapConfig = {
  defaultCenter: { lat: 39.8283, lng: -98.5795 }, // US Center
  defaultZoom: 4,
  maxZoom: 18,
  minZoom: 2,
  clusterEnabled: true,
  heatMapEnabled: false,
};
```

### Location Permissions
```typescript
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};
```

## Testing

### Performance Testing
The application includes built-in performance testing for:
- **1000+ marker rendering**
- **Map interaction responsiveness**
- **Filter application speed**
- **Memory usage optimization**

### Run Tests
```bash
npm test
# or
yarn test
```

### Accessibility Testing
```bash
npm run test:a11y
# or
yarn test:a11y
```

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Leaflet** - Open-source mapping library
- **React-Leaflet** - React components for Leaflet
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [FAQ](docs/FAQ.md)

---

**Built with ❤️ for the energy trading community**
