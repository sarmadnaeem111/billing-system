import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

// Add a new stock item
export const addStockItem = async (shopId, itemData) => {
  try {
    const stockRef = collection(db, 'stock');
    const docRef = await addDoc(stockRef, {
      shopId,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding stock item:', error);
    throw error;
  }
};

// Get all stock items for a shop
export const getShopStock = async (shopId) => {
  try {
    const stockRef = collection(db, 'stock');
    const q = query(stockRef, where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching stock items:', error);
    throw error;
  }
};

// Get a single stock item by ID
export const getStockItemById = async (itemId) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    const stockSnap = await getDoc(stockRef);
    
    if (stockSnap.exists()) {
      return {
        id: stockSnap.id,
        ...stockSnap.data()
      };
    } else {
      throw new Error('Stock item not found');
    }
  } catch (error) {
    console.error('Error fetching stock item:', error);
    throw error;
  }
};

// Update a stock item
export const updateStockItem = async (itemId, updateData) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    await updateDoc(stockRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return itemId;
  } catch (error) {
    console.error('Error updating stock item:', error);
    throw error;
  }
};

// Delete a stock item
export const deleteStockItem = async (itemId) => {
  try {
    const stockRef = doc(db, 'stock', itemId);
    await deleteDoc(stockRef);
    return true;
  } catch (error) {
    console.error('Error deleting stock item:', error);
    throw error;
  }
};

// Update stock quantity when a sale is made
export const updateStockQuantity = async (shopId, items) => {
  try {
    const stockRef = collection(db, 'stock');
    const q = query(stockRef, where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    
    const stockItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process each sold item
    const updates = items.map(soldItem => {
      const stockItem = stockItems.find(item => item.name === soldItem.name);
      
      if (stockItem) {
        const newQuantity = Math.max(0, stockItem.quantity - soldItem.quantity);
        return updateStockItem(stockItem.id, { quantity: newQuantity });
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating stock quantities:', error);
    throw error;
  }
}; 