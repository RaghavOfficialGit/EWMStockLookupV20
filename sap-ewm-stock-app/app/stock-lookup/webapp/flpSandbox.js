/**
 * Fiori Launchpad Sandbox Configuration
 * 
 * This file configures the SAP Fiori Launchpad sandbox for local testing.
 * The application tile appears on the launchpad for navigation.
 */
window["sap-ushell-config"] = {
    defaultRenderer: "fiori2",
    applications: {
        "stockLookup-display": {
            title: "EWM Stock Lookup",
            description: "Search and view warehouse physical stock",
            icon: "sap-icon://inventory",
            additionalInformation: "SAPUI5.Component=ewm.stock.lookup",
            applicationType: "URL",
            url: "../stock-lookup/webapp",
            navigationMode: "embedded"
        }
    }
};
