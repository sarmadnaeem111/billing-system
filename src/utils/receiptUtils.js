import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Generate a unique transaction ID
export const generateTransactionId = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Calculate the total amount of all items
export const calculateTotal = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2);
};

// Save a receipt to Firestore
export const saveReceipt = async (receiptData) => {
  try {
    const receiptRef = collection(db, 'receipts');
    const docRef = await addDoc(receiptRef, {
      ...receiptData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

// Fetch a single receipt by ID
export const getReceiptById = async (receiptId) => {
  try {
    const receiptRef = doc(db, 'receipts', receiptId);
    const receiptSnap = await getDoc(receiptRef);
    
    if (receiptSnap.exists()) {
      return {
        id: receiptSnap.id,
        ...receiptSnap.data()
      };
    } else {
      throw new Error('Receipt not found');
    }
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format date to local date string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format time to local time string
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}; 