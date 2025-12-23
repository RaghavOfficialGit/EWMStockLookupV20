from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="EWM Warehouse Stock Lookup API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load sample data from JSON file
SAMPLE_DATA_FILE = ROOT_DIR / "sample_stock_data.json"

def load_stock_data():
    """Load stock data from JSON file"""
    try:
        with open(SAMPLE_DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading sample data: {e}")
        return []

# Load data on startup
STOCK_DATA = load_stock_data()
logger.info(f"Loaded {len(STOCK_DATA)} stock records from JSON file")


# ================================
# Pydantic Models
# ================================

class WarehousePhysicalStock(BaseModel):
    """Model representing a warehouse physical stock record"""
    id: str
    Product: str
    EWMWarehouse: str
    EWMStockType: str
    Batch: str = ""
    HandlingUnitNumber: str = ""
    EWMStorageBin: str
    EWMStockQuantityInBaseUnit: float
    EWMStockQuantityBaseUnit: str


class StockSearchResponse(BaseModel):
    """Response model for stock search with pagination"""
    value: List[WarehousePhysicalStock]
    count: int
    skip: int
    top: int


# ================================
# API Endpoints
# ================================

@api_router.get("/")
async def root():
    return {"message": "EWM Warehouse Stock Lookup API - Ready"}


@api_router.get("/stock", response_model=StockSearchResponse)
async def get_warehouse_stock(
    product: Optional[str] = Query(None, description="Filter by Product"),
    ewm_stock_type: Optional[str] = Query(None, alias="EWMStockType", description="Filter by Stock Type"),
    batch: Optional[str] = Query(None, description="Filter by Batch"),
    handling_unit: Optional[str] = Query(None, alias="HandlingUnitNumber", description="Filter by Handling Unit"),
    storage_bin: Optional[str] = Query(None, alias="EWMStorageBin", description="Filter by Storage Bin"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    top: int = Query(20, ge=1, le=100, description="Number of records to return")
):
    """
    Search warehouse physical stock records.
    Simulates SAP EWM API: api_whse_physstockprod
    """
    logger.info(f"Stock search - Product: {product}, StockType: {ewm_stock_type}, Batch: {batch}, HU: {handling_unit}, Bin: {storage_bin}")
    
    # Start with all data
    filtered_data = STOCK_DATA.copy()
    
    # Apply filters (only non-empty values)
    if product:
        filtered_data = [d for d in filtered_data if product.upper() in d["Product"].upper()]
    
    if ewm_stock_type:
        filtered_data = [d for d in filtered_data if d["EWMStockType"].upper() == ewm_stock_type.upper()]
    
    if batch:
        filtered_data = [d for d in filtered_data if batch.upper() in d.get("Batch", "").upper()]
    
    if handling_unit:
        filtered_data = [d for d in filtered_data if handling_unit.upper() in d.get("HandlingUnitNumber", "").upper()]
    
    if storage_bin:
        filtered_data = [d for d in filtered_data if storage_bin.upper() in d["EWMStorageBin"].upper()]
    
    # Get total count before pagination
    total_count = len(filtered_data)
    
    # Apply pagination
    paginated_data = filtered_data[skip:skip + top]
    
    logger.info(f"Returning {len(paginated_data)} of {total_count} records")
    
    return StockSearchResponse(
        value=[WarehousePhysicalStock(**d) for d in paginated_data],
        count=total_count,
        skip=skip,
        top=top
    )


@api_router.get("/stock/{stock_id}", response_model=WarehousePhysicalStock)
async def get_stock_detail(stock_id: str):
    """Get details of a specific stock record."""
    for stock in STOCK_DATA:
        if stock["id"] == stock_id:
            return WarehousePhysicalStock(**stock)
    raise HTTPException(status_code=404, detail="Stock record not found")


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
