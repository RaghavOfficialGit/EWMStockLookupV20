using ewm.stock from '../db/schema';

@path: '/stock'
service StockService {
    @readonly
    entity WarehousePhysicalStock as projection on stock.WarehousePhysicalStock;
}
