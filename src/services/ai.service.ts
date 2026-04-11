import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { EnvVariables } from "../config/env";
import { ApiError } from "../utils/ApiResponse";

const ProductExtractionSchema = z.object({
  name: z.string().describe("Tên sản phẩm đầy đủ (ví dụ: iPhone 15 Pro Max)"),
  slug: z.string().describe("Slug thân thiện với URL (ví dụ: iphone-15-pro-max)"),
  shortDescription: z.string().describe("Mô tả ngắn gọn sản phẩm").nullable(),
  description: z.string().describe("Mô tả chi tiết sản phẩm bằng HTML snippet (sử dụng h3, p, ul, li). Viết tiếng Việt chuyên nghiệp."),
  productType: z.enum(["iphone", "ipad", "imac", "macbook", "watch", "airpods", "accessories"]).describe("Loại sản phẩm"),
  categoryName: z.string().describe("Tên danh mục (ví dụ: iPhone, iPad, Watch, Phụ kiện)"),
  brandName: z.string().describe("Tên thương hiệu (ví dụ: Apple, Samsung, Sony)"),
  basePrice: z.number().describe("Giá bán cơ bản thấp nhất (VND)"),
  originalBasePrice: z.number().describe("Giá gốc nếu có (VND)").nullable(),
  images: z.array(z.string()).describe("Danh sách các URL hình ảnh sản phẩm chính tìm được"),
  features: z.array(z.string()).describe("Danh sách 3-5 đặc điểm nổi bật nhất"),
  isNew: z.boolean().describe("Có phải là mẫu mới ra mắt gần đây không?"),
  tags: z.array(z.string()).describe("Danh sách các từ khóa liên quan (ví dụ: apple, iphone, 15 pro max)"),
  variants: z.array(z.object({
    name: z.string().describe("Tên cụ thể của phiên bản (ví dụ: iPhone 15 Pro Max 256GB Titan Tự Nhiên)"),
    color: z.string().describe("Tên màu sắc (ví dụ: Titan Tự Nhiên, Đen, Trắng)"),
    colorCode: z.string().describe("Mã màu Hex (ví dụ: #BEA994)"),
    storage: z.string().describe("Dung lượng bộ nhớ nếu có (ví dụ: 256GB, 512GB)").nullable(),
    price: z.number().describe("Giá bán của phiên bản này (VND)"),
    originalPrice: z.number().describe("Giá gốc của phiên bản này (VND)").nullable(),
    stock: z.number().default(10).describe("Số lượng tồn kho (mặc định 10)"),
    images: z.array(z.string()).describe("Danh sách các URL hình ảnh riêng cho màu này")
  })).describe("Danh sách các phiên bản (màu sắc, dung lượng)"),
  attributes: z.array(z.object({
    name: z.string().describe("Tên thông số (ví dụ: Màn hình, Chip, Camera)"),
    value: z.string().describe("Giá trị thông số (ví dụ: 6.7 inch, A17 Pro)"),
    category: z.string().describe("Nhóm thông số (ví dụ: Màn hình, Hiệu năng)")
  })).describe("Thông số kỹ thuật chi tiết")
});

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (EnvVariables.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: EnvVariables.OPENAI_API_KEY });
    }
  }

  async extractProductData(payload: { promptText?: string; htmlContent?: string; imageUrl?: string }) {
    if (!this.openai) {
      throw new ApiError(500, "OpenAI API Key is not configured on the backend.", null, "api_key_missing");
    }

    const { promptText, htmlContent, imageUrl } = payload;

    const messages: any = [
      {
        role: "system",
        content: `You are an expert e-commerce product manager for an Apple store based in Vietnam.
Your job is to read raw content (markdown, HTML, or images) and extract precise product details into JSON.

Rules:
1. Writing: Use professional Vietnamese for descriptions and names.
2. Prices: Always in VND. If the source is in USD, convert approximately (1 USD = 24,000 VND).
3. Description: Use clean HTML (h3, p, ul, li). Avoid style attributes.
4. Variants: Identify all colors and storage options. If prices differ, reflect that.
5. Attributes: Extract technical specs like CPU, RAM, Screen, Battery.
6. Images: Extract specific URLs of images. Always prefer original, large, zoom, or gallery images. Avoid thumbnails, swatches, icons, previews, or low-resolution placeholders.
7. Logic: Ensure the 'basePrice' matches the cheapest variant.
8. Optional Fields: If a field is not found, return null as per the schema (all fields are required but nullable).
`,
      },
      {
        role: "user",
        content: []
      }
    ];

    let contentStr = "";
    if (promptText) contentStr += `User Prompt: ${promptText}\n`;
    if (htmlContent) contentStr += `Source Content (HTML/Text): ${htmlContent}\n`;

    if (contentStr) {
      messages[1].content.push({ type: "text", text: contentStr });
    }

    if (imageUrl) {
      messages[1].content.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    if (messages[1].content.length === 0) {
      throw new ApiError(400, "Mising source content or imageUrl", null, "bad_request");
    }

    try {
      const response = await this.openai.chat.completions.parse({
        model: "gpt-4o-mini",
        messages,
        response_format: zodResponseFormat(ProductExtractionSchema, "product_extraction"),
        temperature: 0,
      });

      return response.choices[0].message.parsed;
    } catch (error: any) {
      console.error('AI Extraction Error:', error);
      throw new ApiError(500, "AI Extraction failed", error.message, "ai_error");
    }
  }
}

export const aiService = new AIService();
