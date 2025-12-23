/**
 * UI Annotations for Stock Service
 * 
 * Defines Fiori Elements List Report annotations for:
 * - Filter bar configuration
 * - Table columns and layout
 * - Value helps and labels
 */
using StockService from './stock-service';

/**
 * Annotations for WarehousePhysicalStock entity
 */
annotate StockService.WarehousePhysicalStock with @(
    // UI Configuration
    UI: {
        // Header information
        HeaderInfo: {
            TypeName: 'Stock Record',
            TypeNamePlural: 'Stock Records',
            Title: { Value: Product },
            Description: { Value: EWMWarehouse }
        },

        // Selection fields for filter bar (Initial Screen)
        SelectionFields: [
            Product,
            EWMStockType,
            Batch,
            HandlingUnitNumber,
            EWMStorageBin
        ],

        // Table columns for result display
        LineItem: [
            { Value: Product, Label: 'Product', Position: 10 },
            { Value: EWMWarehouse, Label: 'Warehouse', Position: 20 },
            { Value: EWMStockType, Label: 'Stock Type', Position: 30 },
            { Value: EWMStorageBin, Label: 'Storage Bin', Position: 40 },
            { Value: EWMStockQuantityInBaseUnit, Label: 'Quantity', Position: 50 },
            { Value: EWMStockQuantityBaseUnit, Label: 'Unit', Position: 60 }
        ],

        // Facets for object page (if navigation is needed)
        Facets: [
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'StockDetails',
                Label: 'Stock Details',
                Target: '@UI.FieldGroup#StockDetails'
            },
            {
                $Type: 'UI.ReferenceFacet',
                ID: 'AdditionalInfo',
                Label: 'Additional Information',
                Target: '@UI.FieldGroup#AdditionalInfo'
            }
        ],

        // Field groups for object page
        FieldGroup#StockDetails: {
            Label: 'Stock Details',
            Data: [
                { Value: Product, Label: 'Product' },
                { Value: EWMWarehouse, Label: 'Warehouse' },
                { Value: EWMStockType, Label: 'Stock Type' },
                { Value: Batch, Label: 'Batch' },
                { Value: EWMStorageBin, Label: 'Storage Bin' },
                { Value: EWMStockQuantityInBaseUnit, Label: 'Quantity' },
                { Value: EWMStockQuantityBaseUnit, Label: 'Unit of Measure' }
            ]
        },

        FieldGroup#AdditionalInfo: {
            Label: 'Additional Information',
            Data: [
                { Value: HandlingUnitNumber, Label: 'Handling Unit' },
                { Value: EWMStockOwner, Label: 'Stock Owner' },
                { Value: EWMStockUsage, Label: 'Stock Usage' },
                { Value: EntitledToDisposeParty, Label: 'Entitled Party' },
                { Value: EWMResource, Label: 'Resource' }
            ]
        },

        // Presentation variant for default sort and visualization
        PresentationVariant: {
            Text: 'Default',
            SortOrder: [
                { Property: Product, Descending: false }
            ],
            Visualizations: ['@UI.LineItem']
        }
    },

    // Capabilities annotation
    Capabilities: {
        SearchRestrictions: {
            Searchable: false
        },
        InsertRestrictions: {
            Insertable: false
        },
        UpdateRestrictions: {
            Updatable: false
        },
        DeleteRestrictions: {
            Deletable: false
        }
    }
);

/**
 * Field-level annotations for labels and common properties
 */
annotate StockService.WarehousePhysicalStock with {
    ID @(
        UI.Hidden: true,
        Common.Text: Product
    );
    
    Product @(
        title: 'Product',
        Common: {
            Label: 'Product',
            FieldControl: #ReadOnly
        }
    );
    
    EWMWarehouse @(
        title: 'Warehouse',
        Common: {
            Label: 'Warehouse',
            FieldControl: #ReadOnly
        }
    );
    
    EWMStockType @(
        title: 'Stock Type',
        Common: {
            Label: 'Stock Type',
            FieldControl: #ReadOnly
        }
    );
    
    Batch @(
        title: 'Batch',
        Common: {
            Label: 'Batch',
            FieldControl: #ReadOnly
        }
    );
    
    HandlingUnitNumber @(
        title: 'Handling Unit',
        Common: {
            Label: 'Handling Unit',
            FieldControl: #ReadOnly
        }
    );
    
    EWMStorageBin @(
        title: 'Storage Bin',
        Common: {
            Label: 'Storage Bin',
            FieldControl: #ReadOnly
        }
    );
    
    EWMStockQuantityInBaseUnit @(
        title: 'Quantity',
        Common: {
            Label: 'Quantity',
            FieldControl: #ReadOnly
        },
        Measures.Unit: EWMStockQuantityBaseUnit
    );
    
    EWMStockQuantityBaseUnit @(
        title: 'Unit of Measure',
        Common: {
            Label: 'Unit',
            FieldControl: #ReadOnly
        }
    );
    
    EWMStockOwner @(
        title: 'Stock Owner',
        Common: {
            Label: 'Stock Owner',
            FieldControl: #ReadOnly
        }
    );
    
    EWMStockUsage @(
        title: 'Stock Usage',
        Common: {
            Label: 'Stock Usage',
            FieldControl: #ReadOnly
        }
    );
    
    EntitledToDisposeParty @(
        title: 'Entitled Party',
        Common: {
            Label: 'Entitled to Dispose Party',
            FieldControl: #ReadOnly
        }
    );
    
    EWMResource @(
        title: 'Resource',
        Common: {
            Label: 'Resource',
            FieldControl: #ReadOnly
        }
    );
}
