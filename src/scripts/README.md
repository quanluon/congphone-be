# Backend Scripts

This directory contains utility scripts for testing, seeding, and managing the backend.

## Database Scripts

### Seed Admin User
Creates an admin user in the database.

```bash
npx ts-node src/scripts/seedAdmin.ts
```

### Seed Products
Seeds the database with sample products.

```bash
npx ts-node src/scripts/seedProducts.ts
```

### Seed All Data
Seeds the database with all sample data.

```bash
npx ts-node src/scripts/seedData.ts
```

## Telegram Testing Scripts

### Test Telegram Order Notification by Order ID
Test the Telegram notification system with a real order from the database using its MongoDB ObjectId.

```bash
npx ts-node src/scripts/testTelegramOrder.ts <orderId>
```

**Example:**
```bash
npx ts-node src/scripts/testTelegramOrder.ts 507f1f77bcf86cd799439011
```

**Output:**
- ✅ Connection status
- 📋 Order details
- 📤 Notification status
- 🔗 Link to view in Telegram

### Test Telegram Order Notification by Order Number
Test the Telegram notification system using the order number (e.g., ORD-000001).

```bash
npx ts-node src/scripts/testTelegramOrderNumber.ts <orderNumber>
```

**Example:**
```bash
npx ts-node src/scripts/testTelegramOrderNumber.ts ORD-000001
```

**Output:**
- ✅ Connection status
- 📋 Order details (ID, number, customer, items)
- 📤 Notification status
- 🔗 Link to view in Telegram

## How to Find Order IDs

### Method 1: From MongoDB
```javascript
// Connect to your MongoDB
use your_database_name

// Find recent orders
db.orders.find().sort({createdAt: -1}).limit(5).pretty()

// Get specific order by order number
db.orders.findOne({orderNumber: "ORD-000001"})
```

### Method 2: From Application Logs
Check your backend logs when orders are created:
```
Order created: ORD-000001
  orderId: 507f1f77bcf86cd799439011
  customerPhone: +84901234567
  totalAmount: 30000000
```

### Method 3: From API Response
When you create an order via the API, the response includes the order ID:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-000001",
    ...
  }
}
```

## Prerequisites

Before running Telegram test scripts:

1. **Environment Variables**: Ensure `.env` file contains:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

2. **Database Connection**: MongoDB must be running and accessible

3. **Orders in Database**: At least one order must exist in the database

## Troubleshooting

### "Order not found" Error
- Verify the order ID/number exists in the database
- Check MongoDB connection string
- Ensure you're using the correct database name

### Telegram Connection Failed
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check bot is active (not revoked)
- Test with [@BotFather](https://t.me/botfather)

### Message Not Sent
- Verify `TELEGRAM_CHAT_ID` is correct
- Check bot has been added to the chat/group/channel
- Ensure bot has permission to send messages
- For groups/channels, bot must be an administrator

## Additional Resources

- [Telegram Setup Guide](../../TELEGRAM_SETUP.md) - Complete Telegram bot configuration
- [API Documentation](../../API_DOCUMENTATION.md) - API endpoints and usage
- [Build Optimization](../../BUILD_OPTIMIZATION.md) - Build and deployment optimization

## Development Tips

### Creating Custom Scripts

When creating new scripts:

1. Import necessary services and models
2. Connect to MongoDB at the start
3. Close connection before exit
4. Handle errors gracefully
5. Provide clear console output

**Template:**
```typescript
import mongoose from "mongoose";
import { EnvVariables } from "../config/env";

async function myScript() {
  try {
    // Connect to database
    await mongoose.connect(EnvVariables.MONGODB_URI, {
      dbName: EnvVariables.MONGODB_NAME,
    });
    
    // Your script logic here
    
    console.log("✅ Script completed successfully");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

myScript();
```

### Running Scripts in Production

For production environments, consider:

1. Using environment-specific configuration
2. Adding transaction support for data integrity
3. Implementing rollback mechanisms
4. Logging to external services
5. Adding dry-run mode for testing

**Example with dry-run:**
```bash
# Dry run (preview changes without applying)
DRY_RUN=true npx ts-node src/scripts/myScript.ts

# Actual execution
npx ts-node src/scripts/myScript.ts
```

