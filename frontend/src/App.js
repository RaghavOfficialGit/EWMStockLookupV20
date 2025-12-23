import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// SAP Fiori-inspired color palette
const colors = {
  shellHeader: "#354A5F",
  shellHeaderText: "#FFFFFF",
  brand: "#0A6ED1",
  brandHover: "#085CB3",
  positive: "#107E3E",
  negative: "#BB0000",
  critical: "#E9730C",
  neutral: "#6A6D70",
  background: "#F7F7F7",
  surface: "#FFFFFF",
  border: "#E5E5E5",
  text: "#32363A",
  textSecondary: "#6A6D70",
};

// Filter Bar Component
const FilterBar = ({ filters, onFilterChange, onSearch, onClear, loading }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <span className="text-xs text-gray-500">All fields are optional</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Product Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">Product</label>
          <input
            type="text"
            value={filters.product}
            onChange={(e) => onFilterChange("product", e.target.value)}
            placeholder="e.g., MAT001"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-product"
          />
        </div>
        
        {/* Stock Type Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">Stock Type</label>
          <input
            type="text"
            value={filters.stockType}
            onChange={(e) => onFilterChange("stockType", e.target.value)}
            placeholder="e.g., F1, F2"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-stock-type"
          />
        </div>
        
        {/* Batch Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">Batch</label>
          <input
            type="text"
            value={filters.batch}
            onChange={(e) => onFilterChange("batch", e.target.value)}
            placeholder="e.g., BATCH001"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-batch"
          />
        </div>
        
        {/* Handling Unit Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">Handling Unit</label>
          <input
            type="text"
            value={filters.handlingUnit}
            onChange={(e) => onFilterChange("handlingUnit", e.target.value)}
            placeholder="e.g., HU001"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-handling-unit"
          />
        </div>
        
        {/* Storage Bin Filter */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">Storage Bin</label>
          <input
            type="text"
            value={filters.storageBin}
            onChange={(e) => onFilterChange("storageBin", e.target.value)}
            placeholder="e.g., BIN-A01"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="filter-storage-bin"
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          data-testid="btn-clear"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          data-testid="btn-search"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Searching...
            </>
          ) : (
            "Go"
          )}
        </button>
      </div>
    </div>
  );
};

// Stock Table Component
const StockTable = ({ data, loading, totalCount, currentPage, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p className="text-gray-600">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium">No stock data found</p>
          <p className="text-sm">Try adjusting your filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Stock Records</h3>
        <span className="text-xs text-gray-500" data-testid="record-count">
          Showing {startRecord} - {endRecord} of {totalCount} records
        </span>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full" data-testid="stock-table">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Warehouse</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Stock Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Storage Bin</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-blue-50 transition-colors cursor-pointer"
                data-testid={`stock-row-${index}`}
              >
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.Product}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.EWMWarehouse}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    item.EWMStockType.startsWith('F') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.EWMStockType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 font-mono">{item.EWMStorageBin}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                  {item.EWMStockQuantityInBaseUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.EWMStockQuantityBaseUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="btn-prev-page"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="btn-next-page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [filters, setFilters] = useState({
    product: "",
    stockType: "",
    batch: "",
    handlingUnit: "",
    storageBin: "",
  });
  
  const [stockData, setStockData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const pageSize = 20;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const fetchStockData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // Add non-empty filters
      if (filters.product) params.append("product", filters.product);
      if (filters.stockType) params.append("EWMStockType", filters.stockType);
      if (filters.batch) params.append("batch", filters.batch);
      if (filters.handlingUnit) params.append("HandlingUnitNumber", filters.handlingUnit);
      if (filters.storageBin) params.append("EWMStorageBin", filters.storageBin);
      
      // Add pagination
      params.append("skip", ((page - 1) * pageSize).toString());
      params.append("top", pageSize.toString());
      
      const response = await axios.get(`${API}/stock?${params.toString()}`);
      
      setStockData(response.data.value);
      setTotalCount(response.data.count);
      setCurrentPage(page);
      setHasSearched(true);
      
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError(err.response?.data?.detail || "Failed to fetch stock data. Please try again.");
      setStockData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStockData(1);
  };

  const handleClear = () => {
    setFilters({
      product: "",
      stockType: "",
      batch: "",
      handlingUnit: "",
      storageBin: "",
    });
    setStockData([]);
    setTotalCount(0);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    fetchStockData(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SAP Shell Header */}
      <header className="bg-[#354A5F] text-white shadow-md" data-testid="app-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <div>
              <h1 className="text-lg font-semibold">EWM Warehouse Stock Lookup</h1>
              <p className="text-xs text-gray-300">SAP Extended Warehouse Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Preview Mode</span>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Physical Stock Inquiry</h2>
          <p className="text-sm text-gray-600 mt-1">
            Search warehouse physical stock records using the filters below. Click "Go" to fetch data.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Preview Mode:</strong> This is a visual preview of the SAP Fiori application. 
              In production, data would be fetched from SAP EWM via the standard API using SAP Cloud SDK and BTP Destination.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="error-message">
            <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-red-800 font-medium">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {hasSearched && (
          <StockTable
            data={stockData}
            loading={loading}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}

        {/* Initial State - Before Search */}
        {!hasSearched && !loading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <svg className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-600">Enter filter criteria and click "Go"</p>
              <p className="text-sm text-gray-500 mt-1">All filter fields are optional</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>SAP EWM Warehouse Stock Lookup &bull; Preview Version</p>
          <p className="text-xs mt-1">Consuming: api_whse_physstockprod via BTP Destination EWM_HMF</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
