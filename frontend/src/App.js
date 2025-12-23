import { useState, useCallback } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      
      if (filters.product) params.append("product", filters.product);
      if (filters.stockType) params.append("EWMStockType", filters.stockType);
      if (filters.batch) params.append("batch", filters.batch);
      if (filters.handlingUnit) params.append("HandlingUnitNumber", filters.handlingUnit);
      if (filters.storageBin) params.append("EWMStorageBin", filters.storageBin);
      
      params.append("skip", ((page - 1) * pageSize).toString());
      params.append("top", pageSize.toString());
      
      const response = await axios.get(`${API}/stock?${params.toString()}`);
      
      setStockData(response.data.value);
      setTotalCount(response.data.count);
      setCurrentPage(page);
      setHasSearched(true);
      
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError(err.response?.data?.detail || "Failed to fetch stock data");
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
    setFilters({ product: "", stockType: "", batch: "", handlingUnit: "", storageBin: "" });
    setStockData([]);
    setTotalCount(0);
    setHasSearched(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    fetchStockData(newPage);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#354A5F", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>EWM Warehouse Stock Lookup</h1>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>SAP Extended Warehouse Management</p>
          </div>
        </div>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>Preview Mode</span>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        {/* Page Title */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#32363A" }}>Physical Stock Inquiry</h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#6A6D70" }}>Search warehouse physical stock records. Click "Go" to fetch data.</p>
        </div>

        {/* Info Banner */}
        <div style={{ backgroundColor: "#E5F1FB", border: "1px solid #B3D4FC", borderRadius: "8px", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A6ED1" style={{ flexShrink: 0, marginTop: "2px" }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <p style={{ margin: 0, fontSize: "14px", color: "#0A6ED1" }}>
            <strong>Preview Mode:</strong> This is a visual preview. In production, data would be fetched from SAP EWM via SAP Cloud SDK and BTP Destination.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#32363A" }}>Filters</h3>
            <span style={{ fontSize: "12px", color: "#6A6D70" }}>All fields are optional</span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "16px" }}>
            {/* Product */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#6A6D70", marginBottom: "4px" }}>Product</label>
              <input
                type="text"
                value={filters.product}
                onChange={(e) => handleFilterChange("product", e.target.value)}
                placeholder="e.g., MAT001"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                data-testid="filter-product"
              />
            </div>
            
            {/* Stock Type */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#6A6D70", marginBottom: "4px" }}>Stock Type</label>
              <input
                type="text"
                value={filters.stockType}
                onChange={(e) => handleFilterChange("stockType", e.target.value)}
                placeholder="e.g., F1, F2"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                data-testid="filter-stock-type"
              />
            </div>
            
            {/* Batch */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#6A6D70", marginBottom: "4px" }}>Batch</label>
              <input
                type="text"
                value={filters.batch}
                onChange={(e) => handleFilterChange("batch", e.target.value)}
                placeholder="e.g., BATCH001"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                data-testid="filter-batch"
              />
            </div>
            
            {/* Handling Unit */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#6A6D70", marginBottom: "4px" }}>Handling Unit</label>
              <input
                type="text"
                value={filters.handlingUnit}
                onChange={(e) => handleFilterChange("handlingUnit", e.target.value)}
                placeholder="e.g., HU001"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                data-testid="filter-handling-unit"
              />
            </div>
            
            {/* Storage Bin */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#6A6D70", marginBottom: "4px" }}>Storage Bin</label>
              <input
                type="text"
                value={filters.storageBin}
                onChange={(e) => handleFilterChange("storageBin", e.target.value)}
                placeholder="e.g., BIN-A01"
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E5E5", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                data-testid="filter-storage-bin"
              />
            </div>
          </div>
          
          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              onClick={handleClear}
              style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "500", color: "#32363A", backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "4px", cursor: "pointer" }}
              data-testid="btn-clear"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{ padding: "8px 24px", fontSize: "14px", fontWeight: "500", color: "white", backgroundColor: loading ? "#89B8E0" : "#0A6ED1", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}
              data-testid="btn-search"
            >
              {loading ? "Searching..." : "Go"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2", borderRadius: "8px", padding: "16px", marginBottom: "16px" }} data-testid="error-message">
            <p style={{ margin: 0, color: "#C62828", fontSize: "14px" }}><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div style={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            {/* Table Header */}
            <div style={{ padding: "12px 16px", backgroundColor: "#FAFAFA", borderBottom: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#32363A" }}>Stock Records</h3>
              <span style={{ fontSize: "12px", color: "#6A6D70" }} data-testid="record-count">
                {totalCount > 0 ? `Showing ${startRecord} - ${endRecord} of ${totalCount} records` : "No records"}
              </span>
            </div>
            
            {/* Loading */}
            {loading && (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <p style={{ color: "#6A6D70" }}>Loading stock data...</p>
              </div>
            )}
            
            {/* No Data */}
            {!loading && stockData.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="#E5E5E5" style={{ marginBottom: "16px" }}>
                  <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "500", color: "#6A6D70" }}>No stock data found</p>
                <p style={{ margin: 0, fontSize: "14px", color: "#9E9E9E" }}>Try adjusting your filter criteria</p>
              </div>
            )}
            
            {/* Table */}
            {!loading && stockData.length > 0 && (
              <>
                <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="stock-table">
                    <thead style={{ backgroundColor: "#FAFAFA", position: "sticky", top: 0 }}>
                      <tr>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Product</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Warehouse</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Stock Type</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Storage Bin</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Quantity</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6A6D70", textTransform: "uppercase", borderBottom: "1px solid #E5E5E5" }}>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockData.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #F5F5F5" }} data-testid={`stock-row-${index}`}>
                          <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#0A6ED1" }}>{item.Product}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px", color: "#32363A" }}>{item.EWMWarehouse}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ 
                              display: "inline-block", 
                              padding: "2px 8px", 
                              fontSize: "12px", 
                              fontWeight: "500", 
                              borderRadius: "4px",
                              backgroundColor: item.EWMStockType.startsWith('F') ? "#E8F5E9" : "#FFF3E0",
                              color: item.EWMStockType.startsWith('F') ? "#2E7D32" : "#E65100"
                            }}>
                              {item.EWMStockType}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "14px", color: "#32363A", fontFamily: "monospace" }}>{item.EWMStorageBin}</td>
                          <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#32363A", textAlign: "right" }}>
                            {item.EWMStockQuantityInBaseUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6A6D70" }}>{item.EWMStockQuantityBaseUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div style={{ padding: "12px 16px", backgroundColor: "#FAFAFA", borderTop: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#6A6D70" }}>Page {currentPage} of {totalPages || 1}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{ padding: "6px 12px", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "4px", backgroundColor: "white", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.5 : 1 }}
                      data-testid="btn-prev-page"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{ padding: "6px 12px", fontSize: "14px", border: "1px solid #E5E5E5", borderRadius: "4px", backgroundColor: "white", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.5 : 1 }}
                      data-testid="btn-next-page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div style={{ backgroundColor: "white", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "64px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#E5E5E5" style={{ marginBottom: "16px" }}>
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <p style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "500", color: "#6A6D70" }}>Enter filter criteria and click "Go"</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#9E9E9E" }}>All filter fields are optional</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "white", borderTop: "1px solid #E5E5E5", marginTop: "32px", padding: "16px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#6A6D70" }}>SAP EWM Warehouse Stock Lookup • Preview Version</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#9E9E9E" }}>Consuming: api_whse_physstockprod via BTP Destination EWM_HMF</p>
      </footer>
    </div>
  );
}

export default App;
