from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

from . import models, schemas, crud
from .database import engine, get_db

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Simplified full-stack assessment backend",
    version="1.0.0"
)

# CORS - Important for React frontend (change to your Vercel URL later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================== HEALTH CHECK ======================
@app.get("/")
def read_root():
    return {"message": "✅ Inventory & Order API is running!"}

# ====================== PRODUCT ENDPOINTS ======================
@app.post("/products/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check unique SKU
    db_product = crud.get_product_by_sku(db, product.sku)
    if db_product:
        raise HTTPException(status_code=400, detail="SKU already exists")
    return crud.create_product(db=db, product=product)

@app.get("/products/", response_model=List[schemas.Product])
def get_all_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.update_product(db=db, product_id=product_id, product=product)

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return crud.delete_product(db=db, product_id=product_id)

# ====================== CUSTOMER ENDPOINTS ======================
@app.post("/customers/", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = crud.get_customer_by_email(db, customer.email)
    if db_customer:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    return crud.create_customer(db=db, customer=customer)

@app.get("/customers/", response_model=List[schemas.Customer])
def get_all_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db, skip=skip, limit=limit)

# ====================== ORDER ENDPOINTS (Business Rules Here) ======================
@app.post("/orders/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Check customer exists
    customer = crud.get_customer(db, order.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check stock for every item BEFORE creating order
    for item in order.items:
        product = crud.get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{product.sku}'. Available: {product.stock}, Requested: {item.quantity}"
            )

    # Create order + reduce stock
    db_order = crud.create_order(db=db, order=order)

    # Reduce stock for each item
    for item in order.items:
        crud.reduce_stock(db, item.product_id, item.quantity)

    # Refresh to get updated data
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[schemas.Order])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_orders(db, skip=skip, limit=limit)

@app.get("/orders/{order_id}", response_model=schemas.Order)
def get_order_by_id(order_id: int, db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)