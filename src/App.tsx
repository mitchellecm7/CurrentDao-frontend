import React from 'react';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
};

export default App
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> ±{userLocation.accuracy}m
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'search', label: 'Advanced Search', icon: '🔍' },
              { key: 'map', label: 'Interactive Map', icon: '🗺️' },
              { key: 'regional', label: 'Regional Markets', icon: '📊' },
              { key: 'distance', label: 'Distance Calculator', icon: '📏' },
              { key: 'heatmap', label: 'Heat Map', icon: '🔥' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Filters */}
            <LocationFilterComponent
              onFiltersChange={handleFiltersChange}
              userLocation={userLocation}
            />

            {/* Filter Summary */}
            {locationFilters.length > 0 && (
              <FilterSummary
                filters={locationFilters}
                onClearAll={() => handleFiltersChange([])}
              />
            )}

            {/* Selected Listing Details */}
            {selectedListing && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Listing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Title:</span> {selectedListing.title}</p>
                  <p><span className="font-medium">Type:</span> {selectedListing.type}</p>
                  <p><span className="font-medium">Price:</span> ${selectedListing.price.toFixed(2)}/MWh</p>
                  <p><span className="font-medium">Capacity:</span> {selectedListing.capacity.toFixed(1)} MW</p>
                  <p><span className="font-medium">Seller:</span> {selectedListing.seller.name}</p>
                  <p><span className="font-medium">Rating:</span> ⭐ {selectedListing.seller.rating.toFixed(1)}</p>
                  {selectedListing.distance && (
                    <p><span className="font-medium">Distance:</span> {selectedListing.distance.toFixed(1)} km</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'search' && (
              <AdvancedSearch
                onResultClick={handleSearchResultClick}
                placeholder="Search energy trades, DAO proposals, market data, and more..."
                showFilters={true}
                showSavedSearches={true}
                showAnalytics={true}
              />
            )}
            {activeTab === 'map' && (
              <InteractiveMap
                listings={listings}
                onMarkerClick={handleMarkerClick}
                onViewportChange={handleViewportChange}
                height="600px"
                showUserLocation={true}
                enableClustering={true}
              />
            )}

            {activeTab === 'regional' && (
              <RegionalMarketComponent
                regionalData={regionalData}
                listings={listings}
                onRegionSelect={handleRegionSelect}
              />
            )}

            {activeTab === 'distance' && (
              <DistanceCalculatorComponent
                userLocation={userLocation}
                selectedListing={selectedListing}
                onCalculationComplete={handleCalculationComplete}
              />
            )}

            {activeTab === 'heatmap' && (
              <HeatMapComponent
                listings={listings}
                viewport={mapState.viewport.bounds || null}
                onHeatMapClick={handleHeatMapClick}
                height="600px"
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Platform Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Interactive map with 1000+ markers</li>
                <li>• Real-time location tracking</li>
                <li>• Advanced filtering options</li>
                <li>• Distance & cost calculations</li>
                <li>• Regional market analysis</li>
                <li>• Trading activity heat maps</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="font-medium">{listings.length}</span> active listings</li>
                <li>• <span className="font-medium">{regionalData.length}</span> regional markets</li>
                <li>• <span className="font-medium">{mapState.markers.length}</span> map markers</li>
                <li>• <span className="font-medium">{locationFilters.length}</span> active filters</li>
                <li>• Clustering enabled for performance</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Privacy & Accessibility</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Location permission controlled by user</li>
                <li>• Data encrypted in transit</li>
                <li>• WCAG 2.1 compliant</li>
                <li>• Keyboard navigation support</li>
                <li>• Screen reader compatible</li>
                <li>• Cross-browser tested</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Geographic Location-Based Trading Interface © 2024 | Built with React, TypeScript, and Leaflet</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
