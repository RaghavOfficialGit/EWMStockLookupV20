using StockService from './stock-service';

annotate StockService.WarehousePhysicalStock with @(
    UI: {
        HeaderInfo: {
            TypeName: 'Stock Record',
            TypeNamePlural: 'Stock Records',
            Title: { Value: Product }
        },
        SelectionFields: [
            Product,
            EWMStockType,
            Batch,
            HandlingUnitNumber,
            EWMStorageBin
        ],
        LineItem: [
            { Value: Product },
            { Value: EWMWarehouse },
            { Value: EWMStockType },
            { Value: EWMStorageBin },
            { Value: EWMStockQuantityInBaseUnit },
            { Value: EWMStockQuantityBaseUnit }
        ]
    }
);

annotate StockService.WarehousePhysicalStock with {
    ID @UI.Hidden;
    Product @title: 'Product';
    EWMWarehouse @title: 'Warehouse';
    EWMStockType @title: 'Stock Type';
    Batch @title: 'Batch';
    HandlingUnitNumber @title: 'Handling Unit';
    EWMStorageBin @title: 'Storage Bin';
    EWMStockQuantityInBaseUnit @title: 'Quantity' @Measures.Unit: EWMStockQuantityBaseUnit;
    EWMStockQuantityBaseUnit @title: 'Unit';
};
