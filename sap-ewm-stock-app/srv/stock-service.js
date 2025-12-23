const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { getDestination } = require('@sap-cloud-sdk/connectivity');

const EWM_API_PATH = '/sap/opu/odata4/sap/api_whse_physstockprod/srvd_a2x/sap/whsephysicalstockproducts/0001/WarehousePhysicalStockProducts';
const DESTINATION_NAME = 'EWM_HMF';

function buildFilterExpression(filters) {
    const conditions = [];
    const fields = ['Product', 'EWMStockType', 'Batch', 'HandlingUnitNumber', 'EWMStorageBin'];
    
    fields.forEach(field => {
        if (filters[field]) {
            const escaped = String(filters[field]).replace(/'/g, "''");
            conditions.push(`${field} eq '${escaped}'`);
        }
    });
    
    return conditions.join(' and ');
}

function extractFilters(query) {
    const filters = {};
    if (query.SELECT && query.SELECT.where) {
        const where = query.SELECT.where;
        for (let i = 0; i < where.length; i++) {
            if (where[i].ref && where[i + 1] === '=' && where[i + 2]) {
                filters[where[i].ref[0]] = where[i + 2].val;
                i += 2;
            }
        }
    }
    return filters;
}

module.exports = cds.service.impl(async function() {
    const { WarehousePhysicalStock } = this.entities;

    this.on('READ', WarehousePhysicalStock, async (req) => {
        try {
            const top = req.query.SELECT?.limit?.rows?.val || 100;
            const skip = req.query.SELECT?.limit?.offset?.val || 0;
            const filters = extractFilters(req.query);
            const filterExpr = buildFilterExpression(filters);

            const queryParams = { '$count': 'true', '$top': String(top), '$skip': String(skip) };
            if (filterExpr) queryParams['$filter'] = filterExpr;

            const destination = await getDestination({ destinationName: DESTINATION_NAME });
            if (!destination) {
                return req.error(502, `Destination '${DESTINATION_NAME}' not found`);
            }

            const queryString = Object.entries(queryParams)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');

            const response = await executeHttpRequest(destination, {
                method: 'GET',
                url: `${EWM_API_PATH}?${queryString}`,
                headers: { 'Accept': 'application/json' }
            });

            if (response.status === 200 && response.data) {
                const data = response.data.value || [];
                const result = data.map((item, idx) => ({
                    ID: `${item.Product}_${item.EWMWarehouse}_${item.EWMStorageBin}_${skip + idx}`,
                    Product: item.Product || '',
                    EWMWarehouse: item.EWMWarehouse || '',
                    EWMStockType: item.EWMStockType || '',
                    Batch: item.Batch || '',
                    HandlingUnitNumber: item.HandlingUnitNumber || '',
                    EWMStorageBin: item.EWMStorageBin || '',
                    EWMStockQuantityInBaseUnit: parseFloat(item.EWMStockQuantityInBaseUnit) || 0,
                    EWMStockQuantityBaseUnit: item.EWMStockQuantityBaseUnit || ''
                }));
                result.$count = response.data['@odata.count'] || 0;
                return result;
            }
            return req.error(502, 'Unexpected API response');
        } catch (error) {
            console.error('Error:', error.message);
            if (error.response?.status === 401) {
                return req.error(401, 'Authentication failed');
            }
            return req.error(500, error.message);
        }
    });
});
