/**
 * Virtual Entity Definitions for EWM Physical Stock
 * 
 * IMPORTANT: No database persistence - these are virtual entities
 * that map to the external SAP EWM API response structure.
 * CAP acts as a proxy/orchestration layer only.
 */
namespace ewm.stock;

/**
 * Virtual entity representing Warehouse Physical Stock Products
 * Maps to SAP Standard API: api_whse_physstockprod
 * 
 * All fields are derived from the SAP standard OData API response
 */
@cds.persistence.skip  // No database table will be created
entity WarehousePhysicalStock {
    key ID                          : String;           // Composite key for UI binding
    Product                         : String(40);       // Material/Product number
    EWMWarehouse                    : String(4);        // EWM Warehouse ID
    EWMStockType                    : String(2);        // Stock type (F1, F2, etc.)
    Batch                           : String(10);       // Batch number
    HandlingUnitNumber              : String(20);       // Handling Unit
    EWMStorageBin                   : String(18);       // Storage Bin
    EWMStockQuantityInBaseUnit      : Decimal(13, 3);   // Quantity in base unit
    EWMStockQuantityBaseUnit        : String(3);        // Unit of measure
    EntitledToDisposeParty          : String(10);       // Party entitled to dispose
    EWMStockOwner                   : String(10);       // Stock owner
    EWMStockUsage                   : String(1);        // Stock usage indicator
    StockDocumentCategory           : String(1);        // Document category
    EWMResource                     : String(18);       // Resource
    WBSElementInternalID            : String(24);       // WBS Element
    SpecialStockIdfgSalesOrder      : String(10);       // Sales Order for special stock
    SpecialStockIdfgSalesOrderItem  : String(6);        // Sales Order Item
}
