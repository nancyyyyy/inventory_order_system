import { useState, useEffect } from "react";
import axios from "axios";
import { Package, Users, ShoppingCart } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [activeTab, setActiveTab] = useState<
    "products" | "customers" | "orders"
  >("products");
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/products/`);
    setProducts(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get(`${API}/customers/`);
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
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
    if (products.length === 0) return alert("Pehle product banao");
    const data = {
      customer_id: 1,
      items: [{ product_id: products[0].id, quantity: 2 }],
    };
    try {
      await axios.post(`${API}/orders/`, data);
      setMessage("✅ Order Placed + Stock Automatically Reduced! 🎉");
      fetchProducts();
    } catch (err: any) {
      setMessage("❌ " + (err.response?.data?.detail || "Order Failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-3xl font-bold text-center">
          📦 Inventory & Order Management System
        </h1>
        <p className="text-center mt-1">Assessment Submission - Nancy</p>
      </header>

      <div className="flex justify-center gap-4 my-4">
        {["products", "customers", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              setMessage("");
            }}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            {tab === "products" && <Package />}
            {tab === "customers" && <Users />}
            {tab === "orders" && <ShoppingCart />}
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-6">
        <button
          onClick={createProduct}
          className="bg-green-500 text-white px-4 py-2 m-2 rounded"
        >
          ➕ Quick Add Product
        </button>
        <button
          onClick={createCustomer}
          className="bg-purple-500 text-white px-4 py-2 m-2 rounded"
        >
          👤 Quick Add Customer
        </button>
        <button
          onClick={createOrder}
          className="bg-orange-500 text-white px-4 py-2 m-2 rounded"
        >
          🛒 Place Order (Stock Reduce)
        </button>

        {message && (
          <div className="bg-yellow-100 p-3 my-3 font-bold">{message}</div>
        )}

        {activeTab === "products" && (
          <>
            <h2>Products</h2>
            <button
              onClick={fetchProducts}
              className="bg-gray-500 text-white px-3 py-1"
            >
              Refresh
            </button>
            <pre className="bg-gray-100 p-4 mt-3 overflow-auto">
              {JSON.stringify(products, null, 2)}
            </pre>
          </>
        )}

        {activeTab === "customers" && (
          <>
            <h2>Customers</h2>
            <button onClick={fetchCustomers}>Refresh Customers</button>
            <pre className="bg-gray-100 p-4 mt-3">
              {JSON.stringify(customers, null, 2)}
            </pre>
          </>
        )}

        {activeTab === "orders" && (
          <div>
            <h2>Orders Section</h2>
            <p>
              Click "Place Order" button above to test business rule (Stock
              Reduction)
            </p>
            <button
              onClick={createOrder}
              className="bg-red-500 text-white px-5 py-3 mt-3 text-lg"
            >
              🔥 Create Order + Check Stock Reduction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
