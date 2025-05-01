const translations = {
  en: {
    // Navbar
    dashboard: "Dashboard",
    newReceipt: "New Receipt",
    receipts: "Receipts",
    inventory: "Inventory",
    employees: "Employees",
    viewEmployees: "View Employees",
    addEmployee: "Add Employee",
    attendance: "Attendance",
    viewAttendance: "View Attendance",
    markAttendance: "Mark Attendance",
    attendanceReport: "Attendance Report",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    
    // Common buttons
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    view: "View",
    back: "Back",
    submit: "Submit",
    
    // Additional menu items
    stockInventory: "Stock Inventory",
    addNewEmployee: "Add New Employee",
    attendanceRecords: "Attendance Records",
    shopSettings: "Shop Settings",
    
    // Language toggle
    switchToUrdu: "اردو",
    switchToEnglish: "English",
    
    // Admin Panel
    adminPanel: "Admin Panel",
    pendingApprovals: "Pending Approvals",
    manageUsers: "Manage Users",
    menu: "Menu",
    
    // Data related translations
    productName: "Product Name",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    date: "Date",
    status: "Status",
    paid: "Paid",
    unpaid: "Unpaid",
    customer: "Customer",
    phone: "Phone",
    address: "Address",
    email: "Email",
    description: "Description",
    action: "Action",
    invoiceNo: "Invoice No.",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax",
    grandTotal: "Grand Total",
    
    // Common statuses and messages
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    processing: "Processing",
    cancelled: "Cancelled",
    approved: "Approved",
    rejected: "Rejected",
    noDataFound: "No data found",
    confirmDelete: "Are you sure you want to delete?",
    dataUpdated: "Data updated successfully",
    dataSaved: "Data saved successfully",
    dataDeleted: "Data deleted successfully",
    error: "An error occurred",
    selectOption: "Select an option",

    // Dashboard specific translations
    todaysAttendance: "Today's Attendance:",
    present: "Present",
    absent: "Absent",
    recentReceipts: "Recent Receipts",
    receiptId: "Receipt ID",
    noReceiptsYet: "No receipts yet. Start creating receipts!",
    loading: "Loading...",
    
    // Dynamic message templates
    "You have generated {count} receipt(s) so far.": "You have generated {count} receipt(s) so far.",
    "You have {count} employee(s) registered.": "You have {count} employee(s) registered.",

    // New Receipt page translations
    createNewReceipt: "Create New Receipt",
    cashierName: "Cashier Name",
    selectCashier: "Select Cashier",
    enterManually: "Other (Enter Manually)",
    enterCashierName: "Enter cashier name",
    managerName: "Manager Name (Optional)",
    selectManager: "Select Manager",
    enterManagerName: "Enter manager name",
    paymentMethod: "Payment Method",
    cash: "Cash",
    creditCard: "Credit Card",
    debitCard: "Debit Card",
    bankTransfer: "Bank Transfer",
    mobilePayment: "Mobile Payment",
    transactionId: "Transaction ID",
    barcodeScanner: "Barcode Scanner",
    barcodeScannerHelp: "Scan product barcodes to automatically add items to the receipt. Items with registered barcodes will be added automatically.",
    items: "Items",
    itemName: "Item Name",
    qty: "Qty",
    remove: "Remove",
    addItem: "+ Add Item",
    generateReceipt: "Generate Receipt",
    downloadPDF: "Download PDF",
    viewReceipt: "View Receipt",
    receiptNumber: "Receipt #:",
    time: "Time:",
    cashier: "Cashier:",
    manager: "Manager:",
    payment: "Payment:",
    thankYou: "Thank you for your business!",
    
    // Error and success messages
    receiptCreated: "Receipt created successfully and inventory updated!",
    failedToCreateReceipt: "Failed to create receipt: ",
    scanned: "Scanned: ",
    itemNotFound: "Item with barcode {barcode} not found in inventory",
    scanningError: "Error scanning barcode. Please try again.",
    cashierRequired: "Cashier name is required",
    itemDetailsRequired: "All item details are required",
    invalidPrices: "Item prices must be valid numbers greater than 0",
    invalidQuantities: "Item quantities must be valid numbers greater than 0",
    inventoryError: "Inventory error: ",
    itemNotInInventory: "Item not found in inventory",
    insufficientQuantity: "Insufficient quantity (Available: {available})",

    // View Receipts (All Receipts) page translations
    allReceipts: "All Receipts",
    searchReceipts: "Search Receipts",
    searchPlaceholder: "Search by ID, cashier, or items...",
    filterByDate: "Filter by Date",
    clear: "Clear",
    loadingReceipts: "Loading receipts...",
    noReceiptsMatch: "No receipts match your search criteria.",
    noReceiptsFound: "No receipts found. Start by creating a new receipt.",
    date: "Date",
    transactionId: "Transaction ID",
    cashier: "Cashier",
    items: "Items",
    totalAmount: "Total Amount",
    payment: "Payment",
    action: "Action",
    createNewReceipt: "Create New Receipt",
    view: "View",

    // Stock inventory page
    addNewItem: "Add New Item",
    searchItems: "Search Items",
    searchItemsPlaceholder: "Search by name, description...",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    loadingStockItems: "Loading stock items...",
    category: "Category",
    lastUpdated: "Last Updated",
    actions: "Actions",
    noItemsMatch: "No items match your search criteria. Try adjusting your filters.",
    noItemsFound: "You haven't added any stock items yet. Click 'Add New Item' to get started.",
    deleteItemConfirmation: "Are you sure you want to delete this item? This action cannot be undone.",

    // Employees page
    name: "Name",
    position: "Position",
    contact: "Contact",
    joiningDate: "Joining Date",
    loadingEmployees: "Loading employees...",
    noEmployeesFound: "No employees found. Add some employees to get started!",
    confirmDeleteEmployee: "Are you sure you want to delete this employee?",
    failedToDeleteEmployee: "Failed to delete employee. Please try again.",

    // Add Employee page
    nameRequired: "Name*",
    positionRequired: "Position*",
    contactRequired: "Contact Number*",
    monthlySalary: "Monthly Salary",
    adding: "Adding...",
    requiredFieldsError: "Name, position, and contact number are required",
    failedToAddEmployee: "Failed to add employee. Please try again.",

    // Settings page
    basicInformation: "Basic Information",
    shopName: "Shop Name",
    enterShopName: "Enter shop name",
    enterShopAddress: "Enter shop address",
    phoneNumbers: "Phone Numbers",
    addNewPhoneNumber: "Add New Phone Number",
    enterPhoneNumber: "Enter phone number",
    staffInformation: "Staff Information",
    cashierNames: "Cashier Names",
    managerNames: "Manager Names",
    phoneNumberExists: "This phone number already exists.",
    cashierNameExists: "This cashier name already exists.",
    managerNameExists: "This manager name already exists.",
    shopNameRequired: "Shop name is required.",
    settingsUpdated: "Settings updated successfully.",
    failedToUpdateSettings: "Failed to update settings: ",
    saving: "Saving...",

    // Attendance page
    attendanceRecords: "Attendance Records",
    employee: "Employee",
    checkIn: "Check In",
    checkOut: "Check Out",
    notes: "Notes",
    halfDay: "Half Day",
    onLeave: "On Leave",
    allEmployees: "All Employees",
    loadingAttendance: "Loading attendance records...",
    noAttendanceRecords: "No attendance records found for the selected criteria.",
    failedToLoadEmployees: "Failed to load employees. Please try again.",
    failedToLoadAttendance: "Failed to load attendance records. Please try again.",
    unknownEmployee: "Unknown Employee",

    // Mark Attendance page
    selectDate: "Select Date",
    loadingEmployees: "Loading employees...",
    submitting: "Submitting...",
    submitAttendance: "Save Attendance",
    optionalNotes: "Add notes",
    attendanceMarkedSuccess: "Attendance marked successfully!",
    failedToSubmitAttendance: "Failed to submit attendance. Please try again.",
  },
  ur: {
    // Navbar
    dashboard: "ڈیش بورڈ",
    newReceipt: "نئی رسید",
    receipts: "رسیدیں",
    inventory: "انوینٹری",
    employees: "ملازمین",
    viewEmployees: "ملازمین دیکھیں",
    addEmployee: "ملازم شامل کریں",
    attendance: "حاضری",
    viewAttendance: "حاضری دیکھیں",
    markAttendance: "حاضری لگائیں",
    attendanceReport: "حاضری رپورٹ",
    settings: "ترتیبات",
    logout: "لاگ آؤٹ",
    login: "لاگ ان",
    register: "رجسٹر",
    
    // Common buttons
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    edit: "ترمیم کریں",
    delete: "حذف کریں",
    add: "شامل کریں",
    view: "دیکھیں",
    back: "واپس",
    submit: "جمع کرائیں",
    
    // Additional menu items
    stockInventory: "اسٹاک انوینٹری",
    addNewEmployee: "نیا ملازم شامل کریں",
    attendanceRecords: "حاضری ریکارڈز",
    shopSettings: "دکان کی ترتیبات",
    
    // Language toggle
    switchToUrdu: "اردو",
    switchToEnglish: "English",
    
    // Admin Panel
    adminPanel: "ایڈمن پینل",
    pendingApprovals: "زیر التواء منظوریاں",
    manageUsers: "صارفین کا انتظام کریں",
    menu: "مینو",
    
    // Data related translations
    productName: "پروڈکٹ کا نام",
    quantity: "مقدار",
    price: "قیمت",
    total: "کل",
    date: "تاریخ",
    status: "حالت",
    paid: "ادا کیا گیا",
    unpaid: "غیر ادا شدہ",
    customer: "گاہک",
    phone: "فون",
    address: "پتہ",
    email: "ای میل",
    description: "تفصیل",
    action: "عمل",
    invoiceNo: "انوائس نمبر",
    subtotal: "ذیلی کل",
    discount: "رعایت",
    tax: "ٹیکس",
    grandTotal: "مجموعی کل",
    
    // Common statuses and messages
    active: "فعال",
    inactive: "غیر فعال",
    pending: "زیر التواء",
    completed: "مکمل",
    processing: "پروسیسنگ",
    cancelled: "منسوخ",
    approved: "منظور شدہ",
    rejected: "مسترد",
    noDataFound: "کوئی ڈیٹا نہیں ملا",
    confirmDelete: "کیا آپ واقعی حذف کرنا چاہتے ہیں؟",
    dataUpdated: "ڈیٹا کامیابی سے اپ ڈیٹ ہو گیا",
    dataSaved: "ڈیٹا کامیابی سے محفوظ ہو گیا",
    dataDeleted: "ڈیٹا کامیابی سے حذف ہو گیا",
    error: "ایک خرابی پیش آگئی",
    selectOption: "ایک آپشن منتخب کریں",

    // Dashboard specific translations
    todaysAttendance: "آج کی حاضری:",
    present: "موجود",
    absent: "غیر حاضر",
    recentReceipts: "حالیہ رسیدیں",
    receiptId: "رسید آئی ڈی",
    noReceiptsYet: "ابھی تک کوئی رسید نہیں ہے۔ رسیدیں بنانا شروع کریں!",
    loading: "لوڈ ہو رہا ہے...",
    
    // Dynamic message templates
    "You have generated {count} receipt(s) so far.": "آپ نے اب تک {count} رسید(وں) کو تیار کیا ہے۔",
    "You have {count} employee(s) registered.": "آپ کے پاس {count} ملازم(ین) رجسٹرڈ ہیں۔",

    // New Receipt page translations
    createNewReceipt: "نئی رسید بنائیں",
    cashierName: "کیشیئر کا نام",
    selectCashier: "کیشیئر منتخب کریں",
    enterManually: "دیگر (دستی درج کریں)",
    enterCashierName: "کیشیئر کا نام درج کریں",
    managerName: "مینیجر کا نام (اختیاری)",
    selectManager: "مینیجر منتخب کریں",
    enterManagerName: "مینیجر کا نام درج کریں",
    paymentMethod: "ادائیگی کا طریقہ",
    cash: "نقد",
    creditCard: "کریڈٹ کارڈ",
    debitCard: "ڈیبٹ کارڈ",
    bankTransfer: "بینک ٹرانسفر",
    mobilePayment: "موبائل ادائیگی",
    transactionId: "ٹرانزیکشن آئی ڈی",
    barcodeScanner: "بارکوڈ اسکینر",
    barcodeScannerHelp: "رسید میں آئٹمز کو خود بخود شامل کرنے کے لیے پروڈکٹ بارکوڈز اسکین کریں۔ رجسٹرڈ بارکوڈز والے آئٹمز خود بخود شامل ہو جائیں گے۔",
    items: "آئٹمز",
    itemName: "آئٹم کا نام",
    qty: "تعداد",
    remove: "ہٹائیں",
    addItem: "+ آئٹم شامل کریں",
    generateReceipt: "رسید تیار کریں",
    downloadPDF: "پی ڈی ایف ڈاؤنلوڈ کریں",
    viewReceipt: "رسید دیکھیں",
    receiptNumber: "رسید #:",
    time: "وقت:",
    cashier: "کیشیئر:",
    manager: "مینیجر:",
    payment: "ادائیگی:",
    thankYou: "کاروبار کے لیے آپ کا شکریہ!",
    
    // Error and success messages
    receiptCreated: "رسید کامیابی سے تیار کر دی گئی اور انوینٹری اپڈیٹ کر دی گئی!",
    failedToCreateReceipt: "رسید بنانے میں ناکامی: ",
    scanned: "اسکین کیا گیا: ",
    itemNotFound: "بارکوڈ {barcode} والا آئٹم انوینٹری میں نہیں ملا",
    scanningError: "بارکوڈ اسکین کرنے میں خرابی۔ دوبارہ کوشش کریں۔",
    cashierRequired: "کیشیئر کا نام ضروری ہے",
    itemDetailsRequired: "تمام آئٹم کی تفصیلات ضروری ہیں",
    invalidPrices: "آئٹم کی قیمتیں 0 سے زیادہ درست اعداد ہونی چاہئیں",
    invalidQuantities: "آئٹم کی مقدار 0 سے زیادہ درست اعداد ہونی چاہئیں",
    inventoryError: "انوینٹری میں خرابی: ",
    itemNotInInventory: "آئٹم انوینٹری میں نہیں ملا",
    insufficientQuantity: "ناکافی مقدار (دستیاب: {available})",

    // View Receipts (All Receipts) page translations
    allReceipts: "تمام رسیدیں",
    searchReceipts: "رسیدیں تلاش کریں",
    searchPlaceholder: "آئی ڈی، کیشیئر، یا آئٹمز سے تلاش کریں...",
    filterByDate: "تاریخ سے فلٹر کریں",
    clear: "صاف کریں",
    loadingReceipts: "رسیدیں لوڈ ہو رہی ہیں...",
    noReceiptsMatch: "آپ کے تلاش کے معیار سے کوئی رسید مطابقت نہیں رکھتی۔",
    noReceiptsFound: "کوئی رسیدیں نہیں ملیں۔ نئی رسید بنا کر شروع کریں۔",
    date: "تاریخ",
    transactionId: "ٹرانزیکشن آئی ڈی",
    cashier: "کیشیئر",
    items: "آئٹمز",
    totalAmount: "کل رقم",
    payment: "ادائیگی",
    action: "عمل",
    createNewReceipt: "نئی رسید بنائیں",
    view: "دیکھیں",

    // Stock inventory page
    addNewItem: "نیا آئٹم شامل کریں",
    searchItems: "آئٹمز تلاش کریں",
    searchItemsPlaceholder: "نام، تفصیل سے تلاش کریں...",
    filterByCategory: "زمرہ سے فلٹر کریں",
    allCategories: "تمام زمرے",
    loadingStockItems: "اسٹاک آئٹمز لوڈ ہو رہے ہیں...",
    category: "زمرہ",
    lastUpdated: "آخری اپڈیٹ",
    actions: "عمل",
    noItemsMatch: "آپ کی تلاش کے معیار سے کوئی آئٹم مطابقت نہیں رکھتا۔ اپنے فلٹر کو ایڈجسٹ کرنے کی کوشش کریں۔",
    noItemsFound: "آپ نے ابھی تک کوئی اسٹاک آئٹم شامل نہیں کیا ہے۔ شروع کرنے کے لیے 'نیا آئٹم شامل کریں' پر کلک کریں۔",
    deleteItemConfirmation: "کیا آپ واقعی اس آئٹم کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔",

    // Employees page
    name: "نام",
    position: "عہدہ",
    contact: "رابطہ",
    joiningDate: "شمولیت کی تاریخ",
    loadingEmployees: "ملازمین لوڈ ہو رہے ہیں...",
    noEmployeesFound: "کوئی ملازم نہیں ملا۔ شروع کرنے کے لیے کچھ ملازمین شامل کریں!",
    confirmDeleteEmployee: "کیا آپ واقعی اس ملازم کو حذف کرنا چاہتے ہیں؟",
    failedToDeleteEmployee: "ملازم کو حذف کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",

    // Add Employee page
    nameRequired: "نام*",
    positionRequired: "عہدہ*",
    contactRequired: "رابطہ نمبر*",
    monthlySalary: "ماہانہ تنخواہ",
    adding: "شامل کیا جا رہا ہے...",
    requiredFieldsError: "نام، عہدہ، اور رابطہ نمبر ضروری ہیں",
    failedToAddEmployee: "ملازم کو شامل کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",

    // Settings page
    basicInformation: "بنیادی معلومات",
    shopName: "دکان کا نام",
    enterShopName: "دکان کا نام درج کریں",
    enterShopAddress: "دکان کا پتہ درج کریں",
    phoneNumbers: "فون نمبرز",
    addNewPhoneNumber: "نیا فون نمبر شامل کریں",
    enterPhoneNumber: "فون نمبر درج کریں",
    staffInformation: "عملے کی معلومات",
    cashierNames: "کیشیئر کے نام",
    managerNames: "مینیجر کے نام",
    phoneNumberExists: "یہ فون نمبر پہلے سے موجود ہے۔",
    cashierNameExists: "یہ کیشیئر کا نام پہلے سے موجود ہے۔",
    managerNameExists: "یہ مینیجر کا نام پہلے سے موجود ہے۔",
    shopNameRequired: "دکان کا نام ضروری ہے۔",
    settingsUpdated: "ترتیبات کامیابی سے اپڈیٹ ہو گئیں۔",
    failedToUpdateSettings: "ترتیبات اپڈیٹ کرنے میں ناکامی: ",
    saving: "محفوظ کیا جا رہا ہے...",

    // Attendance page
    attendanceRecords: "حاضری ریکارڈز",
    employee: "ملازم",
    checkIn: "چیک اِن",
    checkOut: "چیک آؤٹ",
    notes: "نوٹس",
    halfDay: "نصف دن",
    onLeave: "چھٹی پر",
    allEmployees: "تمام ملازمین",
    loadingAttendance: "حاضری ریکارڈز لوڈ ہو رہے ہیں...",
    noAttendanceRecords: "منتخب معیار کے لیے کوئی حاضری ریکارڈ نہیں ملا۔",
    failedToLoadEmployees: "ملازمین کو لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    failedToLoadAttendance: "حاضری ریکارڈز لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    unknownEmployee: "نامعلوم ملازم",

    // Mark Attendance page
    selectDate: "تاریخ منتخب کریں",
    loadingEmployees: "ملازمین لوڈ ہو رہے ہیں...",
    submitting: "جمع کیا جا رہا ہے...",
    submitAttendance: "حاضری محفوظ کریں",
    optionalNotes: "نوٹس شامل کریں",
    attendanceMarkedSuccess: "حاضری کامیابی سے درج کر دی گئی!",
    failedToSubmitAttendance: "حاضری جمع کرانے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
  }
};

// Helper function to translate data fields
export const translateData = (data, language) => {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => translateData(item, language));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const translatedData = {};
    for (const key in data) {
      if (key === 'status' && translations[language][data[key]]) {
        // Translate status values directly
        translatedData[key] = translations[language][data[key]];
      } else if (key === 'message' && translations[language][data[key]]) {
        // Handle message templates
        translatedData[key] = translations[language][data[key]];
      } else {
        // Recursively translate nested objects
        translatedData[key] = translateData(data[key], language);
      }
    }
    return translatedData;
  }
  
  // Handle strings that might need translation
  if (typeof data === 'string') {
    // Try to translate common terms
    return translations[language][data] || data;
  }
  
  // Return as is for numbers, booleans, etc.
  return data;
};

// Helper function to get translated text for a given key
export const getTranslatedText = (key, language) => {
  return translations[language]?.[key] || key;
};

export default translations; 