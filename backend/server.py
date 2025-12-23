from fastapi import FastAPI, APIRouter, Query, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ================================
# Models for EWM Stock Lookup
# ================================

class WarehousePhysicalStock(BaseModel):
    """Model representing a warehouse physical stock record"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    Product: str
    EWMWarehouse: str
    EWMStockType: str
    Batch: Optional[str] = ""
    HandlingUnitNumber: Optional[str] = ""
    EWMStorageBin: str
    EWMStockQuantityInBaseUnit: float
    EWMStockQuantityBaseUnit: str
    EWMStockOwner: Optional[str] = ""
    EWMStockUsage: Optional[str] = ""
    EntitledToDisposeParty: Optional[str] = ""
    EWMResource: Optional[str] = ""

class StockSearchResponse(BaseModel):
    """Response model for stock search with pagination"""
    value: List[WarehousePhysicalStock]
    count: int
    skip: int
    top: int


# ================================
# Sample Data Generator (Simulates SAP EWM API)
# ================================

def generate_sample_stock_data() -> List[dict]:
    """
    Generate sample warehouse stock data.
    In production, this would be replaced by actual SAP EWM API call.
    """
    products = [
        "MAT001", "MAT002", "MAT003", "MAT004", "MAT005",
        "PROD-A100", "PROD-A200", "PROD-B100", "PROD-B200", "PROD-C100",
        "RAW-001", "RAW-002", "RAW-003", "FG-001", "FG-002"
    ]
    warehouses = ["WH01", "WH02", "WH03"]
    stock_types = ["F1", "F2", "F3", "S1", "S2"]
    storage_bins = [
        "BIN-A01-01", "BIN-A01-02", "BIN-A02-01", "BIN-A02-02",
        "BIN-B01-01", "BIN-B01-02", "BIN-B02-01", "BIN-B02-02",
        "BIN-C01-01", "BIN-C01-02", "BIN-C02-01", "BIN-C02-02"
    ]
    units = ["EA", "KG", "L", "PC", "BOX"]
    batches = ["BATCH001", "BATCH002", "BATCH003", "", ""]
    handling_units = ["HU001", "HU002", "HU003", "", "", ""]
    
    stock_data = []
    for i in range(150):  # Generate 150 sample records
        stock_data.append({
            "id": str(uuid.uuid4()),
            "Product": random.choice(products),
            "EWMWarehouse": random.choice(warehouses),
            "EWMStockType": random.choice(stock_types),
            "Batch": random.choice(batches),
            "HandlingUnitNumber": random.choice(handling_units),
            "EWMStorageBin": random.choice(storage_bins),
            "EWMStockQuantityInBaseUnit": round(random.uniform(10, 1000), 2),
            "EWMStockQuantityBaseUnit": random.choice(units),
            "EWMStockOwner": f"OWNER{random.randint(1, 5):02d}",
            "EWMStockUsage": random.choice(["1", "2", "3", ""]),
            "EntitledToDisposeParty": f"PARTY{random.randint(1, 3):02d}",
            "EWMResource": f"RES{random.randint(1, 10):03d}"
        })
    
    return stock_data

# Cache sample data on startup
SAMPLE_STOCK_DATA = generate_sample_stock_data()


# ================================
# API Endpoints
# ================================

@api_router.get("/")
async def root():
    return {"message": "EWM Warehouse Stock Lookup API"}


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
    
    This endpoint simulates the SAP EWM API:
    GET /sap/opu/odata4/sap/api_whse_physstockprod/srvd_a2x/sap/whsephysicalstockproducts/0001/WarehousePhysicalStockProducts
    
    In production, this would call the actual SAP API via SAP Cloud SDK and BTP Destination.
    """
    logger.info(f"Stock search - Product: {product}, StockType: {ewm_stock_type}, Batch: {batch}, HU: {handling_unit}, Bin: {storage_bin}")
    
    # Filter the sample data based on query parameters
    filtered_data = SAMPLE_STOCK_DATA.copy()
    
    if product:
        filtered_data = [d for d in filtered_data if product.upper() in d["Product"].upper()]
    
    if ewm_stock_type:
        filtered_data = [d for d in filtered_data if d["EWMStockType"] == ewm_stock_type]
    
    if batch:
        filtered_data = [d for d in filtered_data if batch.upper() in d["Batch"].upper()]
    
    if handling_unit:
        filtered_data = [d for d in filtered_data if handling_unit.upper() in d["HandlingUnitNumber"].upper()]
    
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
    """
    Get details of a specific stock record.
    """
    for stock in SAMPLE_STOCK_DATA:
        if stock["id"] == stock_id:
            return WarehousePhysicalStock(**stock)
    
    raise HTTPException(status_code=404, detail="Stock record not found")


@api_router.get("/metadata")
async def get_metadata():
    """
    Return metadata about available filter options.
    Useful for populating dropdown values in the UI.
    """
    products = sorted(set(d["Product"] for d in SAMPLE_STOCK_DATA))
    stock_types = sorted(set(d["EWMStockType"] for d in SAMPLE_STOCK_DATA))
    warehouses = sorted(set(d["EWMWarehouse"] for d in SAMPLE_STOCK_DATA))
    storage_bins = sorted(set(d["EWMStorageBin"] for d in SAMPLE_STOCK_DATA))
    
    return {
        "products": products,
        "stockTypes": stock_types,
        "warehouses": warehouses,
        "storageBins": storage_bins,
        "totalRecords": len(SAMPLE_STOCK_DATA)
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
