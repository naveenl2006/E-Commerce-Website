import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert('❌ Error fetching products');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      alert('✅ Product deleted');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete product');
    }
  };

  const handleEditChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, editProduct);
      alert('✅ Product updated');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="product-list-container">
      <h2>All Products</h2>
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>₹ Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod._id}>
              <td><img src={prod.image} alt={prod.name} className="prod-img" /></td>
              <td>{prod.name}</td>
              <td>₹{prod.price}</td>
              <td>{prod.category}</td>
              <td>
                <button onClick={() => setEditProduct(prod)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(prod._id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editProduct && (
        <form onSubmit={handleUpdate} className="edit-form">
          <h3>Edit Product</h3>
          <input type="text" name="name" value={editProduct.name} onChange={handleEditChange} required />
          <input type="number" name="price" value={editProduct.price} onChange={handleEditChange} required />
          <input type="text" name="category" value={editProduct.category} onChange={handleEditChange} required />
          <input type="text" name="image" value={editProduct.image} onChange={handleEditChange} required />
          <textarea name="description" value={editProduct.description} onChange={handleEditChange} required />
          <div className="edit-form-buttons">
            <button type="submit" className="update-btn">Update</button>
            <button type="button" onClick={() => setEditProduct(null)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductList;
