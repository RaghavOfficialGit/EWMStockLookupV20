/**
 * Custom Error Handler Extension
 * 
 * Provides user-friendly error messages for common API errors.
 * Can be extended to handle additional error scenarios.
 */
sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(MessageBox, MessageToast) {
    "use strict";

    return {
        /**
         * Handle API error responses
         * 
         * @param {Object} error - Error object from OData request
         */
        handleError: function(error) {
            var errorMessage = "An unexpected error occurred";
            var errorDetails = "";

            if (error.responseText) {
                try {
                    var errorObj = JSON.parse(error.responseText);
                    if (errorObj.error && errorObj.error.message) {
                        errorMessage = errorObj.error.message.value || errorObj.error.message;
                    }
                } catch (e) {
                    errorMessage = error.responseText;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Determine error type and customize message
            var statusCode = error.statusCode || (error.response && error.response.statusCode);
            
            switch (statusCode) {
                case 401:
                case 403:
                    errorMessage = "Authentication failed. Please contact your administrator.";
                    errorDetails = "Your session may have expired or you don't have the required permissions.";
                    break;
                case 404:
                    errorMessage = "The requested resource was not found.";
                    errorDetails = "The SAP EWM API endpoint may not be available.";
                    break;
                case 500:
                    errorMessage = "An internal server error occurred.";
                    errorDetails = "Please try again later or contact support.";
                    break;
                case 502:
                case 503:
                    errorMessage = "Unable to connect to SAP system.";
                    errorDetails = "The destination may be misconfigured or the system is unavailable.";
                    break;
                default:
                    // Use the message we extracted above
                    break;
            }

            // Show error dialog
            MessageBox.error(errorMessage, {
                title: "Error",
                details: errorDetails,
                styleClass: "sapUiResponsiveMargin",
                actions: [MessageBox.Action.CLOSE]
            });
        },

        /**
         * Show no data message
         */
        showNoDataMessage: function() {
            MessageToast.show("No stock data found for the given criteria", {
                duration: 3000,
                width: "20em"
            });
        },

        /**
         * Show loading message
         */
        showLoadingMessage: function() {
            MessageToast.show("Loading stock data...", {
                duration: 1500
            });
        }
    };
});
