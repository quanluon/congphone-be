# Telegram Bot Setup Guide

This guide will help you set up Telegram notifications for order creation.

## Features

- 🎉 Real-time order notifications sent to Telegram
- 📋 Formatted order details with emojis
- 💰 Complete payment summary with discounts
- 📍 Shipping address information
- 🔗 Direct link to order dashboard
- ⚡ Non-blocking notifications (won't affect order creation)

## Prerequisites

1. A Telegram account
2. Access to create a Telegram bot via [@BotFather](https://t.me/botfather)
3. A Telegram group or channel (optional, can use direct messages)

## Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions:
   - Choose a name for your bot (e.g., "Order Notifications")
   - Choose a username for your bot (must end in 'bot', e.g., "my_order_notifications_bot")
4. BotFather will provide you with a **Bot Token**. Save this token securely.
   - Example: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789`

## Step 2: Get Your Chat ID

### Option A: Send Notifications to Yourself (Direct Message)

1. Search for your bot username in Telegram
2. Start a conversation with your bot by clicking "Start"
3. Send any message to your bot (e.g., "Hello")
4. Open this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual bot token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
5. Look for the `"chat":{"id":` field in the JSON response
6. Your chat ID will be a number (e.g., `123456789`)

### Option B: Send Notifications to a Group

1. Create a new Telegram group
2. Add your bot to the group:
   - Open group settings
   - Click "Add Members"
   - Search for your bot username and add it
3. Make your bot an administrator (optional but recommended):
   - Group settings → Administrators → Add Administrator
   - Select your bot
4. Send a message in the group (e.g., "Hello bot")
5. Open this URL in your browser:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
6. Look for the `"chat":{"id":` field in the JSON response
7. Group chat IDs are typically negative numbers (e.g., `-1001234567890`)

### Option C: Send Notifications to a Channel

1. Create a new Telegram channel
2. Add your bot as an administrator:
   - Channel settings → Administrators → Add Administrator
   - Search for your bot and add it
   - Give it "Post Messages" permission
3. Send a message in the channel
4. Open this URL in your browser:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
5. Look for the `"chat":{"id":` field
6. Channel IDs start with `-100` (e.g., `-1001234567890`)

## Step 3: Configure Environment Variables

Add the following environment variables to your `.env` file in the `be/` directory:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
TELEGRAM_CHAT_ID=123456789
TELEGRAM_MENTION_USER_IDS=1659457166
```

Replace the values with:
- `TELEGRAM_BOT_TOKEN`: Your bot token from BotFather
- `TELEGRAM_CHAT_ID`: Your chat/group/channel ID from Step 2
- `TELEGRAM_MENTION_USER_IDS`: Comma-separated list of user IDs to mention (optional)

### User Mentions (Optional)

You can tag specific users when new orders are created. This will send them a notification:

**Single user:**
```env
TELEGRAM_MENTION_USER_IDS=1659457166
```

**Multiple users:**
```env
TELEGRAM_MENTION_USER_IDS=1659457166,987654321,555666777
```

**How to find a user's ID:**
1. Forward a message from the user to a bot that shows user IDs (like [@userinfobot](https://t.me/userinfobot))
2. Or use the `getUpdates` method after the user sends a message to your bot
3. The user must have interacted with your bot at least once

**Note:** If you don't set this variable, it will default to user ID `1659457166`. To disable mentions entirely, set it to an empty string:
```env
TELEGRAM_MENTION_USER_IDS=
```

## Step 4: Test the Integration

### Option A: Test with an Existing Order (Recommended)

Test the Telegram notification with a real order from your database:

**By Order ID:**
```bash
cd be
npx ts-node src/scripts/testTelegramOrder.ts <orderId>
```

Example:
```bash
npx ts-node src/scripts/testTelegramOrder.ts 507f1f77bcf86cd799439011
```

**By Order Number:**
```bash
cd be
npx ts-node src/scripts/testTelegramOrderNumber.ts <orderNumber>
```

Example:
```bash
npx ts-node src/scripts/testTelegramOrderNumber.ts ORD-000001
```

### Option B: Test Connection Only

Create a simple test script to verify the Telegram connection:

```typescript
// be/src/scripts/testTelegram.ts
import { telegramService } from '../services/telegram.service';

async function testTelegramConnection() {
  console.log('Testing Telegram connection...');
  
  const isConnected = await telegramService.testConnection();
  
  if (isConnected) {
    console.log('✅ Telegram connection successful!');
    
    // Send a test message
    const messageSent = await telegramService.sendMessage(
      '🎉 <b>Test Message</b>\n\nTelegram integration is working correctly!',
      { parse_mode: 'HTML' }
    );
    
    if (messageSent) {
      console.log('✅ Test message sent successfully!');
    } else {
      console.log('❌ Failed to send test message');
    }
  } else {
    console.log('❌ Telegram connection failed');
  }
}

testTelegramConnection();
```

Run the test script:
```bash
cd be
npx ts-node src/scripts/testTelegram.ts
```

## Step 5: Verify Order Notifications

1. Start your backend server
2. Create a test order through your application
3. Check your Telegram chat/group/channel for the order notification

The notification will include:
- Order number and status
- Customer information
- Order items with variants
- Payment summary with discounts
- Shipping address
- Link to view order in dashboard

## Troubleshooting

### Bot Token is Invalid
- Double-check that you copied the entire token from BotFather
- Make sure there are no extra spaces before or after the token
- Verify the token format: `number:alphanumeric_string`

### Chat ID Not Working
- Make sure you sent at least one message to the bot/group/channel
- Verify the chat ID is a valid number (positive for users/bots, negative for groups/channels)
- Check that the bot has been added to the group/channel as an administrator

### Messages Not Appearing
- Verify the bot is still in the group/channel
- Check that the bot has permission to send messages
- Look at the backend logs for error messages
- Test the connection using the test script

### Group/Channel Notifications Not Working
- Make sure the bot is an administrator
- Give the bot permission to post messages
- For channels, the bot needs "Post Messages" permission

## Message Format Customization

The Telegram service uses HTML formatting. You can customize the message format in:

```
be/src/services/telegram.service.ts
```

Look for the `formatOrderMessage()` method to modify:
- Message structure
- Emojis
- Information displayed
- Formatting style

### Available HTML Tags

- `<b>text</b>` - Bold text
- `<i>text</i>` - Italic text
- `<u>text</u>` - Underlined text
- `<s>text</s>` - Strikethrough text
- `<code>text</code>` - Monospace text
- `<a href="URL">text</a>` - Hyperlink

## Security Considerations

1. **Keep your bot token secret**: Never commit it to version control
2. **Use environment variables**: Store sensitive data in `.env` files
3. **Restrict bot permissions**: Only give necessary permissions in groups/channels
4. **Monitor bot usage**: Check logs regularly for unauthorized access
5. **Rotate tokens periodically**: Create a new bot token if compromised

## Additional Features

You can extend the Telegram service to:

- Send order status updates
- Notify on payment confirmations
- Alert on cancelled orders
- Send daily/weekly order summaries
- Notify on low stock items
- Send error/system alerts

### Example: Sending Custom Notifications

```typescript
import { telegramService } from './services/telegram.service';

// Simple text message
await telegramService.sendMessage('Order status updated!');

// Formatted HTML message
await telegramService.sendMessage(
  '<b>Order #12345</b>\nStatus: Shipped 🚚',
  { parse_mode: 'HTML' }
);

// Send notification by order ID
await telegramService.sendOrderNotificationById('507f1f77bcf86cd799439011');

// Send notification by order number
await telegramService.sendOrderNotificationByNumber('ORD-000001');
```

### Example: Adding Status Update Notifications

You can add notifications for order status changes in your order service:

```typescript
// In be/src/services/order.service.ts
async updateOrderStatus(orderId: string, status: string) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
  
  if (order) {
    // Send status update notification
    await telegramService.sendMessage(
      `📝 <b>Order Status Updated</b>\n\n` +
      `Order: <code>${order.orderNumber}</code>\n` +
      `New Status: ${status.toUpperCase()}\n` +
      `Customer: ${order.customer.phone}`,
      { parse_mode: 'HTML' }
    );
  }
  
  return order;
}
```

## Support

For more information about Telegram Bot API:
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Bot Features](https://core.telegram.org/bots/features)
- [HTML Formatting Guide](https://core.telegram.org/bots/api#html-style)

## Example Notification

Here's what an order notification looks like:

```
🎉 NEW ORDER RECEIVED!
📢 User1 User2 - New order alert!

━━━━━━━━━━━━━━━━━━━━
📋 Order Details:
   • Order Number: ORD-000123
   • Status: ⏳ PENDING
   • Payment: ⏳ PENDING
   • Payment Method: COD
   • Created: 13/10/2025, 14:30:45

━━━━━━━━━━━━━━━━━━━━
👤 Customer Information:
   • Name: John Doe
   • Phone: +84901234567
   • Email: john@example.com

━━━━━━━━━━━━━━━━━━━━
🛒 Order Items:

1. iPhone 15 Pro Max
   └ Variant: Natural Titanium, 256GB
   • Quantity: 1
   • Price: ₫30,000,000
   • Subtotal: ₫30,000,000

━━━━━━━━━━━━━━━━━━━━
💰 Payment Summary:
   • Original Total: ₫35,000,000
   • Discount: -₫5,000,000 (14%)
   • Shipping Fee: ₫30,000
   • Total Amount: ₫30,030,000

━━━━━━━━━━━━━━━━━━━━
📍 Shipping Address:
   • Name: John Doe
   • Phone: +84901234567
   • Address: 123 Main Street
   • Ward: Ward 1
   • District: District 1
   • City: Ho Chi Minh City

🔗 View in Dashboard
```

