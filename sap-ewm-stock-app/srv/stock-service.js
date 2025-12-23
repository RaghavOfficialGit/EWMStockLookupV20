/**
 * Stock Service Implementation
 * 
 * Handles runtime calls to SAP EWM Physical Stock API using SAP Cloud SDK.
 * Uses BTP Destination 'EWM_HMF' for connectivity and authentication.
 * 
 * @module stock-service
 */
const cds = require('@sap/cds');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { getDestination } = require('@sap-cloud-sdk/connectivity');

// SAP EWM API endpoint path
const EWM_API_PATH = '/sap/opu/odata4/sap/api_whse_physstockprod/srvd_a2x/sap/whsephysicalstockproducts/0001/WarehousePhysicalStockProducts';

// Destination name configured in BTP
const DESTINATION_NAME = 'EWM_HMF';

/**
 * Build OData $filter string from query parameters
 * Only includes non-null/non-empty fields
 * 
 * @param {Object} filters - Filter parameters from request
 * @returns {string} OData $filter expression
 */
function buildFilterExpression(filters) {
    const filterConditions = [];
    
    // Supported filter fields mapping to SAP API field names
    const filterFields = [
        { param: 'Product', apiField: 'Product' },
        { param: 'EWMStockType', apiField: 'EWMStockType' },
        { param: 'Batch', apiField: 'Batch' },
        { param: 'HandlingUnitNumber', apiField: 'HandlingUnitNumber' },
        { param: 'EWMStorageBin', apiField: 'EWMStorageBin' }
    ];

    filterFields.forEach(({ param, apiField }) => {
        const value = filters[param];
        if (value !== undefined && value !== null && value !== '') {
            // Escape single quotes in value and wrap in quotes
            const escapedValue = String(value).replace(/'/g, "''");
            filterConditions.push(`${apiField} eq '${escapedValue}'`);
        }
    });

    return filterConditions.length > 0 ? filterConditions.join(' and ') : '';
}

/**
 * Extract filter values from CDS query
 * 
 * @param {Object} query - CDS query object
 * @returns {Object} Extracted filter values
 */
function extractFiltersFromQuery(query) {
    const filters = {};
    
    if (query.SELECT && query.SELECT.where) {
        const where = query.SELECT.where;
        
        // Parse CDS where clause to extract filter values
        for (let i = 0; i < where.length; i++) {
            const item = where[i];
            
            if (item.ref && item.ref.length > 0) {
                const fieldName = item.ref[0];
                // Look for the value after '=' operator
                if (where[i + 1] === '=' && where[i + 2]) {
                    filters[fieldName] = where[i + 2].val;
                    i += 2;
                }
            }
        }
    }
    
    return filters;
}

/**
 * Generate unique ID for each record
 * Combines key fields to create a unique identifier
 * 
 * @param {Object} item - Stock record from API
 * @param {number} index - Record index
 * @returns {string} Unique identifier
 */
function generateRecordId(item, index) {
    // Create composite key from available fields
    const keyParts = [
        item.Product || '',
        item.EWMWarehouse || '',
        item.EWMStorageBin || '',
        item.Batch || '',
        item.HandlingUnitNumber || '',
        index.toString()
    ];
    return keyParts.join('_');
}

module.exports = cds.service.impl(async function() {
    const { WarehousePhysicalStock } = this.entities;

    /**
     * Handler for READ operations on WarehousePhysicalStock
     * Calls external SAP EWM API and returns transformed data
     */
    this.on('READ', WarehousePhysicalStock, async (req) => {
        try {
            console.log('[StockService] Processing READ request for WarehousePhysicalStock');
            
            // Extract pagination parameters
            const top = req.query.SELECT?.limit?.rows?.val || 100;
            const skip = req.query.SELECT?.limit?.offset?.val || 0;
            
            // Extract filter parameters from query
            const filters = extractFiltersFromQuery(req.query);
            console.log('[StockService] Extracted filters:', JSON.stringify(filters));
            
            // Build OData filter expression
            const filterExpression = buildFilterExpression(filters);
            console.log('[StockService] Filter expression:', filterExpression);

            // Build query parameters for SAP API
            const queryParams = {
                '$count': 'true',
                '$top': top.toString(),
                '$skip': skip.toString()
            };

            // Add filter if present
            if (filterExpression) {
                queryParams['$filter'] = filterExpression;
            }

            // Get destination from BTP
            console.log('[StockService] Resolving destination:', DESTINATION_NAME);
            const destination = await getDestination({ destinationName: DESTINATION_NAME });
            
            if (!destination) {
                console.error('[StockService] Destination not found:', DESTINATION_NAME);
                req.error(502, `Destination '${DESTINATION_NAME}' not found or not accessible`);
                return;
            }

            console.log('[StockService] Destination resolved successfully');

            // Build query string
            const queryString = Object.entries(queryParams)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');

            const fullPath = `${EWM_API_PATH}?${queryString}`;
            console.log('[StockService] Calling SAP API:', fullPath);

            // Execute HTTP request to SAP EWM API
            const response = await executeHttpRequest(destination, {
                method: 'GET',
                url: fullPath,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('[StockService] API response status:', response.status);

            // Process response
            if (response.status === 200 && response.data) {
                const responseData = response.data;
                
                // Extract total count from @odata.count
                const totalCount = responseData['@odata.count'] || 0;
                console.log('[StockService] Total records:', totalCount);

                // Extract and transform data array
                const stockData = responseData.value || [];
                console.log('[StockService] Records returned:', stockData.length);

                // Transform data to match our entity structure
                const transformedData = stockData.map((item, index) => ({
                    ID: generateRecordId(item, skip + index),
                    Product: item.Product || '',
                    EWMWarehouse: item.EWMWarehouse || '',
                    EWMStockType: item.EWMStockType || '',
                    Batch: item.Batch || '',
                    HandlingUnitNumber: item.HandlingUnitNumber || '',
                    EWMStorageBin: item.EWMStorageBin || '',
                    EWMStockQuantityInBaseUnit: parseFloat(item.EWMStockQuantityInBaseUnit) || 0,
                    EWMStockQuantityBaseUnit: item.EWMStockQuantityBaseUnit || '',
                    EntitledToDisposeParty: item.EntitledToDisposeParty || '',
                    EWMStockOwner: item.EWMStockOwner || '',
                    EWMStockUsage: item.EWMStockUsage || '',
                    StockDocumentCategory: item.StockDocumentCategory || '',
                    EWMResource: item.EWMResource || '',
                    WBSElementInternalID: item.WBSElementInternalID || '',
                    SpecialStockIdfgSalesOrder: item.SpecialStockIdfgSalesOrder || '',
                    SpecialStockIdfgSalesOrderItem: item.SpecialStockIdfgSalesOrderItem || ''
                }));

                // Set $count for OData response
                transformedData.$count = totalCount;

                return transformedData;
            } else {
                console.error('[StockService] Unexpected API response:', response.status);
                req.error(502, 'Unexpected response from SAP EWM API');
            }

        } catch (error) {
            console.error('[StockService] Error calling SAP EWM API:', error.message);
            
            // Handle specific error types
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error?.message?.value || error.message;
                
                if (status === 401 || status === 403) {
                    req.error(401, 'Authentication failed. Please check destination credentials.');
                } else if (status === 404) {
                    req.error(404, 'SAP EWM API endpoint not found. Please verify system configuration.');
                } else {
                    req.error(status, `SAP API Error: ${message}`);
                }
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                req.error(503, 'Unable to connect to SAP system. Please check destination configuration.');
            } else {
                req.error(500, `Internal error: ${error.message}`);
            }
        }
    });

    /**
     * Before handler for validation and logging
     */
    this.before('READ', WarehousePhysicalStock, async (req) => {
        console.log('[StockService] Incoming READ request');
        console.log('[StockService] Query:', JSON.stringify(req.query, null, 2));
    });

    /**
     * After handler for post-processing
     */
    this.after('READ', WarehousePhysicalStock, async (data, req) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log('[StockService] No stock data found for the given criteria');
        } else {
            const count = Array.isArray(data) ? data.length : 1;
            console.log('[StockService] Returning', count, 'records');
        }
    });
});
