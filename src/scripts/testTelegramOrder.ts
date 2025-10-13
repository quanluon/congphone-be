import mongoose from "mongoose";
import { telegramService } from "../services/telegram.service";
import { orderService } from "../services/order.service";
import { EnvVariables } from "../config/env";
import logger from "../utils/logger";

/**
 * Test Telegram notification with a real order from the database
 * Usage: npx ts-node src/scripts/testTelegramOrder.ts <orderId>
 * Example: npx ts-node src/scripts/testTelegramOrder.ts 507f1f77bcf86cd799439011
 */
async function testTelegramOrderNotification() {
  try {
    // Get order ID from command line arguments
    const orderId = process.argv[2];

    if (!orderId) {
      console.error("❌ Error: Order ID is required");
      console.log("\nUsage: npx ts-node src/scripts/testTelegramOrder.ts <orderId>");
      console.log("Example: npx ts-node src/scripts/testTelegramOrder.ts 507f1f77bcf86cd799439011");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(EnvVariables.MONGODB_URI, {
      dbName: EnvVariables.MONGODB_NAME,
    });
    console.log("✅ Connected to MongoDB");

    console.log(`\n🔍 Fetching order with ID: ${orderId}...`);
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      console.error(`❌ Error: Order not found with ID: ${orderId}`);
      process.exit(1);
    }

    console.log("✅ Order found:");
    console.log(`   • Order Number: ${order.orderNumber}`);
    console.log(`   • Customer: ${order.customer.name || order.customer.phone}`);
    console.log(`   • Total Amount: ${order.totalAmount.toLocaleString("vi-VN")} VND`);
    console.log(`   • Status: ${order.status}`);
    console.log(`   • Payment Status: ${order.paymentStatus}`);

    console.log("\n📡 Testing Telegram connection...");
    const isConnected = await telegramService.testConnection();

    if (!isConnected) {
      console.error("❌ Failed to connect to Telegram");
      console.log("\nPlease check:");
      console.log("1. TELEGRAM_BOT_TOKEN is set correctly in .env");
      console.log("2. Bot token is valid");
      console.log("3. Network connection is working");
      process.exit(1);
    }

    console.log("✅ Telegram connection successful");

    console.log("\n📤 Sending order notification to Telegram...");
    const success = await telegramService.sendOrderNotification(order);

    if (success) {
      console.log("✅ Order notification sent successfully!");
      console.log("\nCheck your Telegram chat/group/channel for the notification.");
    } else {
      console.error("❌ Failed to send order notification");
      console.log("\nPlease check:");
      console.log("1. TELEGRAM_CHAT_ID is set correctly in .env");
      console.log("2. Bot has been added to the chat/group/channel");
      console.log("3. Bot has permission to send messages");
      console.log("4. Check backend logs for detailed error messages");
    }

    process.exit(success ? 0 : 1);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    logger.error("Test Telegram order notification failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the test function
testTelegramOrderNotification();

