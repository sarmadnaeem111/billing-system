import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

// Helper function to query receipts for a specific date range
export const getReceiptsForDateRange = async (shopId, startDate, endDate) => {
  try {
    const receiptRef = collection(db, 'receipts');
    
    // First, query only by shopId which doesn't require a composite index
    const shopQuery = query(
      receiptRef,
      where('shopId', '==', shopId)
    );
    
    // Get all receipts for this shop
    const receiptsSnapshot = await getDocs(shopQuery);
    
    // Then filter by date range in memory
    const startTimestamp = startDate.toISOString();
    const endTimestamp = endDate.toISOString();
    
    // Filter receipts by timestamp
    return receiptsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(receipt => 
        receipt.timestamp >= startTimestamp && 
        receipt.timestamp <= endTimestamp
      );
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
};

// Helper function to get product cost price from inventory if not in receipt
const getProductCostPrice = async (shopId, productName) => {
  try {
    // Query the inventory for this product
    const stockRef = collection(db, 'stock');
    const stockQuery = query(
      stockRef,
      where('shopId', '==', shopId),
      where('name', '==', productName)
    );
    
    const stockSnapshot = await getDocs(stockQuery);
    
    if (!stockSnapshot.empty) {
      const stockItem = stockSnapshot.docs[0].data();
      return stockItem.costPrice || 0;
    }
    
    return 0;
  } catch (error) {
    console.log('Error fetching product cost price:', error.message);
    return 0;
  }
};

// Function to calculate daily sales and profit
export const getDailySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  return calculateSalesAndProfit(receipts, shopId);
};

// Function to calculate monthly sales and profit
export const getMonthlySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  // Group by day for the chart data
  const dailyData = [];
  const daysInMonth = {};
  
  receipts.forEach(receipt => {
    const day = format(new Date(receipt.timestamp), 'yyyy-MM-dd');
    
    if (!daysInMonth[day]) {
      daysInMonth[day] = {
        day: format(new Date(receipt.timestamp), 'dd'),
        sales: 0,
        profit: 0,
        receipts: []
      };
    }
    
    daysInMonth[day].receipts.push(receipt);
  });
  
  // Calculate sales and profit for each day
  const dailyCalcPromises = Object.keys(daysInMonth).sort().map(async (day) => {
    const { sales, profit } = await calculateSalesAndProfit(daysInMonth[day].receipts, shopId);
    return {
      day: daysInMonth[day].day,
      sales,
      profit
    };
  });
  
  // Wait for all profit calculations to complete
  dailyData.push(...await Promise.all(dailyCalcPromises));
  
  const totals = await calculateSalesAndProfit(receipts, shopId);
  
  return {
    ...totals,
    dailyData
  };
};

// Function to calculate yearly sales and profit
export const getYearlySalesAndProfit = async (shopId, date = new Date()) => {
  const start = startOfYear(date);
  const end = endOfYear(date);
  
  const receipts = await getReceiptsForDateRange(shopId, start, end);
  
  // Group by month for the chart data
  const monthlyData = [];
  const monthsInYear = {};
  
  receipts.forEach(receipt => {
    const month = format(new Date(receipt.timestamp), 'yyyy-MM');
    
    if (!monthsInYear[month]) {
      monthsInYear[month] = {
        month: format(new Date(receipt.timestamp), 'MMM'),
        sales: 0,
        profit: 0,
        receipts: []
      };
    }
    
    monthsInYear[month].receipts.push(receipt);
  });
  
  // Calculate sales and profit for each month
  const monthlyCalcPromises = Object.keys(monthsInYear).sort().map(async (month) => {
    const { sales, profit } = await calculateSalesAndProfit(monthsInYear[month].receipts, shopId);
    return {
      month: monthsInYear[month].month,
      sales,
      profit
    };
  });
  
  // Wait for all profit calculations to complete
  monthlyData.push(...await Promise.all(monthlyCalcPromises));
  
  const totals = await calculateSalesAndProfit(receipts, shopId);
  
  return {
    ...totals,
    monthlyData
  };
};

// Helper function to calculate sales and profit from receipt items
export const calculateSalesAndProfit = async (receipts, shopId = null) => {
  let sales = 0;
  let profit = 0;
  let totalItems = 0;
  
  // Process each receipt sequentially
  for (const receipt of receipts) {
    sales += parseFloat(receipt.totalAmount || 0);
    
    // Calculate profit based on cost price and selling price
    for (const item of receipt.items) {
      const quantity = parseInt(item.quantity || 1);
      const price = parseFloat(item.price || 0);
      let costPrice = parseFloat(item.costPrice || 0);
      
      // If cost price is not available in the receipt and we have shopId,
      // try to get it from inventory
      if ((costPrice <= 0 || isNaN(costPrice)) && shopId && item.name) {
        costPrice = await getProductCostPrice(shopId, item.name);
      }
      
      // Calculate profit - when cost price is not available, use an estimated profit margin of 30%
      if (costPrice > 0) {
        profit += (price - costPrice) * quantity;
      } else {
        // Fallback: Use an estimated profit margin of 30% when no cost price is available
        profit += (price * 0.3) * quantity;
      }
      
      totalItems += quantity;
    }
  }
  
  // For debugging
  console.log('Sales calculation:', {
    sales,
    profit,
    totalItems,
    transactionCount: receipts.length
  });
  
  return {
    sales,
    profit,
    totalItems,
    transactionCount: receipts.length
  };
}; 