from pydantic import BaseModel, field_validator, ConfigDict
from typing import List, Optional
from datetime import datetime

# ====================== PRODUCT ======================
class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0

    @field_validator('sku')
    @classmethod
    def sku_must_be_unique_format(cls, v: str):
        if len(v) < 3:
            raise ValueError('SKU must be at least 3 characters')
        return v.upper()

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ====================== CUSTOMER ======================
class CustomerBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ====================== ORDER ITEM ======================
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    model_config = ConfigDict(from_attributes=True)

# ====================== ORDER ======================
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    total: Optional[float] = 0.0

class Order(BaseModel):
    id: int
    customer_id: int
    order_date: datetime
    total: float
    items: List[OrderItem]
    model_config = ConfigDict(from_attributes=True)