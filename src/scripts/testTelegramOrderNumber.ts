import mongoose from "mongoose";
import { telegramService } from "../services/telegram.service";
import { orderService } from "../services/order.service";
import { EnvVariables } from "../config/env";
import logger from "../utils/logger";

/**
 * Test Telegram notification with a real order by order number
 * Usage: npx ts-node src/scripts/testTelegramOrderNumber.ts <orderNumber>
 * Example: npx ts-node src/scripts/testTelegramOrderNumber.ts ORD-000001
 */
async function testTelegramOrderNotificationByNumber() {
  try {
    // Get order number from command line arguments
    const orderNumber = process.argv[2];

    if (!orderNumber) {
      logger.error("❌ Error: Order number is required");
      logger.info("\nUsage: npx ts-node src/scripts/testTelegramOrderNumber.ts <orderNumber>");
      logger.info("Example: npx ts-node src/scripts/testTelegramOrderNumber.ts ORD-000001");
      process.exit(1);
    }

    logger.info("🔌 Connecting to MongoDB...");
    await mongoose.connect(EnvVariables.MONGODB_URI!, {
      dbName: EnvVariables.MONGODB_NAME!,
    });
    logger.info("✅ Connected to MongoDB");

    logger.info(`\n🔍 Fetching order with number: ${orderNumber}...`);
    const order = await orderService.getOrderByNumber(orderNumber);

    if (!order) {
      logger.error(`❌ Error: Order not found with number: ${orderNumber}`);
      process.exit(1);
    }

    logger.info("✅ Order found:");
    logger.info(`   • Order ID: ${order._id}`);
    logger.info(`   • Order Number: ${order.orderNumber}`);
    logger.info(`   • Customer: ${order.customer.name || order.customer.phone}`);
    logger.info(`   • Total Amount: ${order.totalAmount.toLocaleString("vi-VN")} VND`);
    logger.info(`   • Status: ${order.status}`);
    logger.info(`   • Payment Status: ${order.paymentStatus}`);
    logger.info(`   • Items: ${order.items.length} item(s)`);

    logger.info("\n📡 Testing Telegram connection...");
    const isConnected = await telegramService.testConnection();

    if (!isConnected) {
      logger.error("❌ Failed to connect to Telegram");
      logger.info("\nPlease check:");
      logger.info("1. TELEGRAM_BOT_TOKEN is set correctly in .env");
      logger.info("2. Bot token is valid");
      logger.info("3. Network connection is working");
      process.exit(1);
    }

    logger.info("✅ Telegram connection successful");

    logger.info("\n📤 Sending order notification to Telegram...");
    const success = await telegramService.sendOrderNotification(order);

    if (success) {
      logger.info("✅ Order notification sent successfully!");
      logger.info("\nCheck your Telegram chat/group/channel for the notification.");
    } else {
      logger.error("❌ Failed to send order notification");
      logger.info("\nPlease check:");
      logger.info("1. TELEGRAM_CHAT_ID is set correctly in .env");
      logger.info("2. Bot has been added to the chat/group/channel");
      logger.info("3. Bot has permission to send messages");
      logger.info("4. Check backend logs for detailed error messages");
    }

    process.exit(success ? 0 : 1);
  } catch (error: any) {
    logger.error({ err: error }, "\n❌ Error");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info("\n🔌 Database connection closed");
  }
}

// Run the test function
testTelegramOrderNotificationByNumber();
