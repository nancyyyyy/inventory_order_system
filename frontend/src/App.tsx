import { useState, useEffect } from "react";
import axios from "axios";
import { Package, Users, ShoppingCart } from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Tab = "products" | "customers" | "orders";

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    const res = await axios.get<Product[]>(`${API}/products/`);
    setProducts(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get<Customer[]>(`${API}/customers/`);
    setCustomers(res.data);
  };

  useEffect(() => {
    async function loadData() {
      await Promise.all([fetchProducts(), fetchCustomers()]);
    }
    loadData();
  }, []);

  const createProduct = async () => {
    const data = {
      sku: "PROD" + Date.now().toString().slice(-4),
      name: "New Product " + Date.now().toString().slice(-4),
      price: 999,
      stock: 10,
    };

    await axios.post(`${API}/products/`, data);
    setMessage("✅ Product Created + Stock Ready");
    fetchProducts();
  };

  const createCustomer = async () => {
    const data = {
      email: `user${Date.now()}@test.com`,
      name: "Nancy Test User",
      phone: "9876543210",
    };

    await axios.post(`${API}/customers/`, data);
    setMessage("✅ Customer Created");
    fetchCustomers();
  };

  const createOrder = async () => {
    if (products.length === 0) {
      setMessage("❗ Create a product first before placing an order.");
      return;
    }

    const data = {
      customer_id: 1,
      items: [{ product_id: products[0].id, quantity: 2 }],
    };

    try {
      await axios.post(`${API}/orders/`, data);
      setMessage("✅ Order Placed + Stock Automatically Reduced! 🎉");
      fetchProducts();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setMessage("❌ " + (axiosError.response?.data?.detail || "Order Failed"));
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="badge">Inventory</span>
          <div>
            <h1>Inventory & Order Management</h1>
            <p className="subtitle">Assessment Submission — Nancy</p>
          </div>
        </div>
      </header>

      <div className="tabs">
        {([
          { key: "products", icon: <Package />, label: "Products" },
          { key: "customers", icon: <Users />, label: "Customers" },
          { key: "orders", icon: <ShoppingCart />, label: "Orders" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.key);
              setMessage("");
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <main className="content-panel">
        <section className="quick-actions card">
          <button type="button" className="action-button action-add" onClick={createProduct}>
            ➕ Quick Add Product
          </button>
          <button type="button" className="action-button action-customer" onClick={createCustomer}>
            👤 Quick Add Customer
          </button>
          <button type="button" className="action-button action-order" onClick={createOrder}>
            🛒 Place Order
          </button>
        </section>

        {message && <div className="status-banner card">{message}</div>}

        <section className="card panel">
          {activeTab === "products" && (
            <>
              <div className="section-title">
                <h2>Products</h2>
                <button type="button" onClick={fetchProducts}>
                  Refresh Products
                </button>
              </div>
              {products.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.sku}</td>
                          <td>{product.name}</td>
                          <td>₹{product.price}</td>
                          <td>{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No products found yet. Use Quick Add Product to create one.</div>
              )}
            </>
          )}

          {activeTab === "customers" && (
            <>
              <div className="section-title">
                <h2>Customers</h2>
                <button type="button" onClick={fetchCustomers}>
                  Refresh Customers
                </button>
              </div>
              {customers.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No customers found yet. Use Quick Add Customer to add one.</div>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <div className="order-panel">
              <div className="section-title">
                <h2>Orders</h2>
              </div>
              <p>
                Use the buttons above to create a customer, add a product, and place an order. The system will automatically reduce stock when an order is created.
              </p>
              <div className="note-card">
                <strong>Tip:</strong> If there is no product or customer yet, create them first before placing an order.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
