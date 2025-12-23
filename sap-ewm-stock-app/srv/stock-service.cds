/**
 * Stock Service Definition
 * 
 * Exposes OData service for UI consumption.
 * No database entities - CAP acts as proxy to external SAP EWM API.
 */
using ewm.stock from '../db/schema';

/**
 * Main service for Warehouse Physical Stock lookup
 * Consumed by Fiori Elements UI
 */
service StockService @(path: '/stock') {

    /**
     * Warehouse Physical Stock entity
     * - Read-only (no create, update, delete)
     * - Supports filtering, pagination, and count
     * - Data fetched from external SAP EWM API at runtime
     */
    @readonly
    @Capabilities: {
        InsertRestrictions.Insertable: false,
        UpdateRestrictions.Updatable: false,
        DeleteRestrictions.Deletable: false,
        FilterRestrictions: {
            FilterExpressionRestrictions: [
                { Property: Product, AllowedExpressions: 'SingleValue' },
                { Property: EWMStockType, AllowedExpressions: 'SingleValue' },
                { Property: Batch, AllowedExpressions: 'SingleValue' },
                { Property: HandlingUnitNumber, AllowedExpressions: 'SingleValue' },
                { Property: EWMStorageBin, AllowedExpressions: 'SingleValue' }
            ]
        }
    }
    entity WarehousePhysicalStock as projection on stock.WarehousePhysicalStock;

    /**
     * Parameters for filter input
     * Used by UI to capture filter criteria before navigation
     */
    type FilterParams {
        Product           : String(40);
        EWMStockType      : String(2);
        Batch             : String(10);
        HandlingUnitNumber: String(20);
        EWMStorageBin     : String(18);
    }
}
