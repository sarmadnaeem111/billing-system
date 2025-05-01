# Dashboard Translation Guide

This guide focuses specifically on translating dashboard data in the Golden Oil Billing System.

## Overview

The dashboard displays various types of data:
1. Static UI text (headings, button labels)
2. Dynamic data (counts, statuses)
3. Table data (recent receipts)
4. Message templates with placeholders

All of these need to be properly translated when the user selects Urdu language.

## Implementing Dashboard Translation

### Static UI Elements

For static text elements like headings, labels, and buttons:

```jsx
<h2><Translate textKey="dashboard" /></h2>
<Button><Translate textKey="view" /></Button>
```

### Dynamic Data & Counts

For dynamic data like counts and statistics:

```jsx
// Using the hook approach
const translatedShopData = useTranslatedData(shopData);
<h3>{translatedShopData.shopName}</h3>

// Or using the component approach
<TranslateData data={todayAttendance.present} />
```

### Message Templates with Placeholders

For messages that include dynamic values:

```jsx
<TranslateData 
  data={{
    message: "You have generated {count} receipt(s) so far.",
    count: receiptCount
  }}
>
  {(data) => (
    <>{data.message.replace('{count}', data.count)}</>
  )}
</TranslateData>
```

### Table Data

For table data like the recent receipts table:

```jsx
// Translate the array of receipts
const translatedReceipts = useTranslatedData(recentReceipts);

// Use translated data in the table
{translatedReceipts.map(receipt => (
  <tr key={receipt.id}>
    <td>{new Date(receipt.timestamp).toLocaleDateString()}</td>
    <td>{receipt.id.substring(0, 8)}</td>
    <td>${receipt.totalAmount}</td>
    <td>
      <Button><Translate textKey="view" /></Button>
    </td>
  </tr>
))}
```

## Adding New Dashboard Translations

1. Add translation keys in `src/utils/translations.js`:

```js
// For static UI elements
todaysAttendance: "Today's Attendance:",  // English
todaysAttendance: "آج کی حاضری:",         // Urdu

// For message templates
"You have {count} employee(s) registered.": "You have {count} employee(s) registered.",  // English
"You have {count} employee(s) registered.": "آپ کے پاس {count} ملازم(ین) رجسٹرڈ ہیں۔",   // Urdu
```

## Testing Dashboard Translation

1. Start the application
2. Visit the dashboard page
3. Toggle between English and Urdu using the language toggle
4. Verify that:
   - All static UI elements are translated
   - Dynamic data and counts are displayed correctly
   - Message templates show correct translations with placeholders filled
   - Table data is properly translated
   - RTL layout is applied for Urdu language

## Automatic Dashboard Translation with DataTranslationProvider

For an even easier approach, you can wrap the entire Dashboard component with a DataTranslationProvider:

```jsx
// In Dashboard.js
import { DataTranslationProvider } from '../utils';

const DashboardContent = () => {
  // Component logic and JSX here
  return (
    // Dashboard UI
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    // All your dashboard data
  });
  
  return (
    <DataTranslationProvider data={dashboardData}>
      <DashboardContent />
    </DataTranslationProvider>
  );
};
```

This approach will automatically translate all of your dashboard data in one place. 