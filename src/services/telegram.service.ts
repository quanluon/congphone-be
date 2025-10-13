import { EnvVariables } from "../config/env";
import logger from "../utils/logger";
import { IOrder } from "../models/order.model";

interface TelegramMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
    username?: string;
  };
}

export class TelegramService {
  private botToken: string;
  private chatId: string;
  private baseUrl: string;

  constructor() {
    this.botToken = EnvVariables.TELEGRAM_BOT_TOKEN;
    this.chatId = EnvVariables.TELEGRAM_CHAT_ID;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send a message to Telegram chat
   */
  async sendMessage(
    message: string,
    options: TelegramMessageOptions = {}
  ): Promise<boolean> {
    try {
      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: options.parse_mode || "HTML",
        disable_web_page_preview:
          options.disable_web_page_preview !== undefined
            ? options.disable_web_page_preview
            : true,
        disable_notification: options.disable_notification || false,
      };

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as TelegramApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.description || `Telegram API error: ${response.status}`
        );
      }

      logger.info("Telegram message sent successfully", {
        messageId: data.result?.message_id,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to send Telegram message:", error);
      // Don't throw error to prevent order creation from failing
      return false;
    }
  }

  /**
   * Format order data into a readable Telegram message
   */
  private formatOrderMessage(order: IOrder): string {
    const statusEmoji = this.getStatusEmoji(order.status);
    const paymentEmoji = this.getPaymentStatusEmoji(order.paymentStatus);

    // Format items list
    const itemsList = order.items
      .map((item: any, index: number) => {
        const productInfo = item.product?.name || "Product";
        const variantInfo = item.variant
          ? `\n   └ Variant: ${[
              item.variant.color,
              item.variant.storage,
              item.variant.size,
              item.variant.connectivity,
              item.variant.simType,
            ]
              .filter(Boolean)
              .join(", ")}`
          : "";
        const priceInfo = item.originalPrice
          ? `<s>${this.formatCurrency(item.originalPrice)}</s> → ${this.formatCurrency(item.price)}`
          : this.formatCurrency(item.price);

        return `${index + 1}. <b>${productInfo}</b>${variantInfo}
   • Quantity: ${item.quantity}
   • Price: ${priceInfo}
   • Subtotal: ${this.formatCurrency(item.price * item.quantity)}`;
      })
      .join("\n\n");

    // Format shipping address
    const shippingInfo = order.shippingAddress
      ? `
📍 <b>Shipping Address:</b>
   • Name: ${order.shippingAddress.fullName}
   • Phone: ${order.shippingAddress.phone}
   • Address: ${order.shippingAddress.address}
   • Ward: ${order.shippingAddress.ward}
   • District: ${order.shippingAddress.district}
   • City: ${order.shippingAddress.city}
   ${order.shippingAddress.postalCode ? `• Postal Code: ${order.shippingAddress.postalCode}` : ""}`
      : "";

    // Calculate discount percentage
    const discountPercentage = order.originalTotalAmount
      ? Math.round(
          ((order.originalTotalAmount - order.totalAmount) /
            order.originalTotalAmount) *
            100
        )
      : 0;

    const discountInfo =
      order.discountAmount && order.discountAmount > 0
        ? `   • Discount: -${this.formatCurrency(order.discountAmount)} ${discountPercentage > 0 ? `(${discountPercentage}%)` : ""}`
        : "";

    const shippingFeeInfo = order.shippingFee
      ? `   • Shipping Fee: ${this.formatCurrency(order.shippingFee)}`
      : "";

    const notesInfo = order.notes
      ? `\n📝 <b>Notes:</b> ${order.notes}`
      : "";

    const dashboardLink = EnvVariables.DASHBOARD_URL
      ? `\n\n🔗 <a href="${EnvVariables.DASHBOARD_URL}/orders/${order._id}">View in Dashboard</a>`
      : "";

    // Build the complete message
    const message = `
🎉 <b>NEW ORDER RECEIVED!</b>

━━━━━━━━━━━━━━━━━━━━
📋 <b>Order Details:</b>
   • Order Number: <code>${order.orderNumber}</code>
   • Status: ${statusEmoji} ${order.status.toUpperCase()}
   • Payment: ${paymentEmoji} ${order.paymentStatus.toUpperCase()}
   ${order.paymentMethod ? `• Payment Method: ${order.paymentMethod}` : ""}
   • Created: ${this.formatDate(order.createdAt)}

━━━━━━━━━━━━━━━━━━━━
👤 <b>Customer Information:</b>
   ${order.customer.name ? `• Name: ${order.customer.name}` : ""}
   • Phone: ${order.customer.phone}
   ${order.customer.email ? `• Email: ${order.customer.email}` : ""}

━━━━━━━━━━━━━━━━━━━━
🛒 <b>Order Items:</b>

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 <b>Payment Summary:</b>
   ${order.originalTotalAmount ? `• Original Total: <s>${this.formatCurrency(order.originalTotalAmount)}</s>` : ""}
   ${discountInfo}
   ${shippingFeeInfo}
   • <b>Total Amount: ${this.formatCurrency(order.totalAmount)}</b>

━━━━━━━━━━━━━━━━━━━━
${shippingInfo}${notesInfo}${dashboardLink}
`.trim();

    return message;
  }

  /**
   * Send order notification to Telegram
   */
  async sendOrderNotification(order: IOrder): Promise<boolean> {
    try {
      const message = this.formatOrderMessage(order);
      return await this.sendMessage(message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (error: any) {
      logger.error("Failed to send order notification to Telegram:", error);
      return false;
    }
  }

  /**
   * Helper methods for formatting
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(date));
  }

  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      pending: "⏳",
      confirmed: "✅",
      processing: "⚙️",
      shipped: "🚚",
      delivered: "📦",
      cancelled: "❌",
    };
    return emojiMap[status] || "📋";
  }

  private getPaymentStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      pending: "⏳",
      paid: "✅",
      failed: "❌",
      refunded: "↩️",
    };
    return emojiMap[status] || "💳";
  }

  /**
   * Send order notification by order ID
   */
  async sendOrderNotificationById(orderId: string): Promise<boolean> {
    try {
      const { orderService } = await import("./order.service");
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        logger.error(`Order not found with ID: ${orderId}`);
        return false;
      }

      return await this.sendOrderNotification(order);
    } catch (error: any) {
      logger.error(`Failed to send order notification by ID ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Send order notification by order number
   */
  async sendOrderNotificationByNumber(orderNumber: string): Promise<boolean> {
    try {
      const { orderService } = await import("./order.service");
      const order = await orderService.getOrderByNumber(orderNumber);

      if (!order) {
        logger.error(`Order not found with number: ${orderNumber}`);
        return false;
      }

      return await this.sendOrderNotification(order);
    } catch (error: any) {
      logger.error(`Failed to send order notification by number ${orderNumber}:`, error);
      return false;
    }
  }

  /**
   * Test the Telegram connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`, {
        method: "GET",
      });

      const data = (await response.json()) as TelegramApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.description || `Telegram API error: ${response.status}`
        );
      }

      logger.info("Telegram bot connection successful", {
        botName: data.result?.username,
      });

      return true;
    } catch (error: any) {
      logger.error("Failed to connect to Telegram:", error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();

