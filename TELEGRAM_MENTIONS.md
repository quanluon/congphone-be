# Telegram User Mentions Guide

This guide explains how to configure user mentions in Telegram order notifications.

## Overview

When a new order is created, you can automatically mention (tag) specific Telegram users to ensure they receive notifications. This is useful for:

- Notifying order managers
- Alerting customer service representatives
- Pinging warehouse staff
- Keeping multiple team members informed

## Configuration

### Environment Variable

The user mentions are configured via the `TELEGRAM_MENTION_USER_IDS` environment variable in your `.env` file:

```env
TELEGRAM_MENTION_USER_IDS=1659457166,987654321,555666777
```

### Formats

**Single User:**
```env
TELEGRAM_MENTION_USER_IDS=1659457166
```

**Multiple Users (Comma-separated):**
```env
TELEGRAM_MENTION_USER_IDS=1659457166,987654321,555666777
```

**With Spaces (Also Valid):**
```env
TELEGRAM_MENTION_USER_IDS=1659457166, 987654321, 555666777
```

**Disable Mentions:**
```env
TELEGRAM_MENTION_USER_IDS=
```

### Default Value

If not set, the system defaults to:
```env
TELEGRAM_MENTION_USER_IDS=1659457166
```

## How to Find User IDs

There are several ways to find a Telegram user's ID:

### Method 1: Using @userinfobot

1. Open [@userinfobot](https://t.me/userinfobot) in Telegram
2. Start a chat with the bot
3. Forward a message from the target user to the bot
4. The bot will display the user's ID

### Method 2: Using Your Bot's getUpdates

1. Have the target user send a message to your bot
2. Open this URL in your browser:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Look for the `"from":{"id":` field in the JSON response
4. The user ID will be a number (e.g., `1659457166`)

### Method 3: Using @RawDataBot

1. Open [@RawDataBot](https://t.me/RawDataBot) in Telegram
2. Forward a message from the target user to the bot
3. The bot will return JSON data including the user ID

### Method 4: Python Script

```python
import requests

BOT_TOKEN = "your_bot_token_here"
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"

response = requests.get(url)
data = response.json()

for update in data['result']:
    if 'message' in update:
        user_id = update['message']['from']['id']
        username = update['message']['from'].get('username', 'N/A')
        first_name = update['message']['from'].get('first_name', 'N/A')
        print(f"User ID: {user_id}, Username: @{username}, Name: {first_name}")
```

## How It Works

When an order is created, the system:

1. Reads the `TELEGRAM_MENTION_USER_IDS` environment variable
2. Splits the string by commas to get individual user IDs
3. Trims whitespace from each ID
4. Creates clickable mention links for each user
5. Formats them in the notification message

### Message Format

The mentions appear at the top of the order notification:

```
🎉 NEW ORDER RECEIVED!
📢 User1 User2 User3 - New order alert!

━━━━━━━━━━━━━━━━━━━━
📋 Order Details:
...
```

Each mention is a clickable link that will:
- Notify the mentioned user (if they have notifications enabled)
- Show the user's profile when clicked
- Work in groups, channels, and private chats

## Examples

### Example 1: E-commerce Team

```env
# Sales manager, warehouse manager, customer service
TELEGRAM_MENTION_USER_IDS=1659457166,123456789,987654321
```

Result:
```
📢 User1 User2 User3 - New order alert!
```

### Example 2: Single Admin

```env
TELEGRAM_MENTION_USER_IDS=1659457166
```

Result:
```
📢 User1 - New order alert!
```

### Example 3: No Mentions

```env
TELEGRAM_MENTION_USER_IDS=
```

Result:
```
🎉 NEW ORDER RECEIVED!

━━━━━━━━━━━━━━━━━━━━
```
(No mention line appears)

## Important Notes

### User Requirements

For mentions to work properly:
- ✅ Users must be members of the group/channel where notifications are sent
- ✅ Users must have interacted with your bot at least once (sent a message or clicked "Start")
- ✅ The bot must have permission to mention users in the chat

### Privacy Considerations

- User IDs are public and not sensitive information
- However, be mindful of who you're mentioning in shared groups
- Users can disable notifications for specific chats if they prefer

### Notification Settings

The mentioned users will receive notifications based on:
- Their Telegram notification settings
- The group/channel's notification settings
- Whether they have muted the chat
- Their device's notification settings

## Testing

To test user mentions:

1. Configure the user IDs in `.env`
2. Restart your backend server
3. Create a test order or run:
   ```bash
   npx ts-node src/scripts/testTelegramOrder.ts <orderId>
   ```
4. Check that mentioned users receive notifications

## Troubleshooting

### Mentions Not Working

**Problem:** Users aren't receiving notifications

**Solutions:**
1. Verify user IDs are correct (check with @userinfobot)
2. Ensure users have started a chat with your bot
3. Check that users are members of the group/channel
4. Verify users haven't muted the chat
5. Confirm the bot has permission to send messages

### Invalid User IDs

**Problem:** Error in logs about invalid user IDs

**Solutions:**
1. User IDs should be numbers only
2. Remove any spaces inside user IDs
3. Use commas to separate multiple IDs
4. Don't use @ symbols or usernames

### No Mentions Appearing

**Problem:** Message sends but no mentions appear

**Solutions:**
1. Check that `TELEGRAM_MENTION_USER_IDS` is set
2. Verify it's not an empty string
3. Restart the backend after changing `.env`
4. Check backend logs for parsing errors

## Advanced Usage

### Dynamic Mentions Based on Order

You can extend the code to mention different users based on order properties:

```typescript
// In telegram.service.ts
private formatUserMentions(order?: IOrder): string {
  let userIds: string[] = [];
  
  // Mention different users based on order amount
  if (order && order.totalAmount > 50000000) {
    // High-value orders: mention managers
    userIds = ["1659457166", "123456789"];
  } else {
    // Regular orders: mention regular staff
    userIds = ["987654321"];
  }
  
  // Create mentions...
}
```

### Custom Labels

You can customize the mention labels instead of "User1", "User2":

```typescript
const mentions = userIds
  .map((userId) => {
    return `<a href="tg://user?id=${userId}">@Admin</a>`;
  })
  .join(" ");
```

### Role-Based Mentions

Create a mapping of roles to user IDs:

```env
TELEGRAM_ADMIN_IDS=1659457166,123456789
TELEGRAM_WAREHOUSE_IDS=987654321,555666777
TELEGRAM_CS_IDS=444555666
```

## Related Documentation

- [Telegram Setup Guide](./TELEGRAM_SETUP.md) - Complete bot setup
- [Scripts README](./src/scripts/README.md) - Testing and utilities
- [Telegram Bot API](https://core.telegram.org/bots/api) - Official documentation

## Summary

User mentions help ensure your team never misses an order:

✅ Configure once in `.env`
✅ Supports multiple users
✅ Automatic notifications on each order
✅ Works in groups, channels, and private chats
✅ Easy to test and troubleshoot

For questions or issues, check the troubleshooting section or review the backend logs.

