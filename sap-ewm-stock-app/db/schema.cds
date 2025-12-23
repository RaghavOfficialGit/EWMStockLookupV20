/**
 * Virtual Entity Definitions for EWM Physical Stock
 * No database persistence - CAP acts as proxy only
 */
namespace ewm.stock;

@cds.persistence.skip
entity WarehousePhysicalStock {
    key ID                          : String;
    Product                         : String(40);
    EWMWarehouse                    : String(4);
    EWMStockType                    : String(2);
    Batch                           : String(10);
    HandlingUnitNumber              : String(20);
    EWMStorageBin                   : String(18);
    EWMStockQuantityInBaseUnit      : Decimal(13, 3);
    EWMStockQuantityBaseUnit        : String(3);
}
