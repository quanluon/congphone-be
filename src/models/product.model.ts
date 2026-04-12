import mongoose from "mongoose";
import { toSlug } from "../utils/string";

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
}

export enum ProductType {
  IPHONE = "iphone",
  IPAD = "ipad",
  IMAC = "imac",
  MACBOOK = "macbook",
  WATCH = "watch",
  AIRPODS = "airpods",
  ACCESSORIES = "accessories",
}

export enum ProductAttributeType {
  CUSTOM = 'custom',
  GUARANTEE = 'guarantee'
}

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  name: string; // e.g., "iPhone 14 Plus 128GB Blue"
  color: string; // e.g., "Blue", "Space Gray", "Silver"
  colorCode: string; // e.g., "#007AFF", "#8E8E93"
  storage?: string; // e.g., "128GB", "256GB", "512GB", "1TB"
  size?: string; // e.g., "6.1 inch", "6.7 inch" for iPhones
  connectivity?: string; // e.g., "Wi-Fi", "Wi-Fi + Cellular"
  simType?: string; // e.g., "Dual SIM", "e-SIM"
  price: number;
  originalPrice?: number; // For showing discounts
  stock: number;
  images: string[];
  attributes: IProductAttribute[]; // Structured attributes for variant-specific specs
  isActive: boolean;
  provider?: string;
  sourceUrl?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductAttribute {
  type: ProductAttributeType
  name: string;
  value: string;
  unit?: string;
  category?: string; // e.g., "Display", "Performance", "Camera", etc.
}

export interface IProductSource {
  provider: string;
  url: string;
  externalId?: string;
  categoryKey: string;
  groupKey?: string;
  memberUrls?: string[];
  lastCrawledAt: Date;
}

export interface IProduct {
  _id?: mongoose.Types.ObjectId;
  name: string; // e.g., "iPhone 14 Plus"
  slug: string; // e.g., "iphone-14-plus"
  description: string; // Rich text content (HTML/JSON)
  shortDescription?: string; // Plain text
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  productType: ProductType;
  variants: IProductVariant[];
  basePrice: number; // Starting price from cheapest variant
  originalBasePrice?: number; // For showing discounts
  images: string[]; // Main product images
  features: string[]; // Key features array
  attributes: IProductAttribute[]; // Structured attributes
  source?: IProductSource;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[]; // For filtering and search
  metaTitle?: string;
  metaDescription?: string;
  vector?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new mongoose.Schema<IProductVariant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      required: true,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    connectivity: {
      type: String,
      trim: true,
    },
    simType: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    attributes: [
      {
        type: {
          type: String,
          enum: ProductAttributeType,
          default: ProductAttributeType.CUSTOM,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        unit: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    productType: {
      type: String,
      enum: ProductType,
      required: true,
    },
    variants: [productVariantSchema],
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalBasePrice: {
      type: Number,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    attributes: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        unit: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ProductAttributeType,
          default: ProductAttributeType.CUSTOM,
        }
      },
    ],
    source: {
      provider: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
      externalId: {
        type: String,
        trim: true,
      },
      categoryKey: {
        type: String,
        trim: true,
      },
      groupKey: {
        type: String,
        trim: true,
      },
      memberUrls: [
        {
          type: String,
          trim: true,
        },
      ],
      lastCrawledAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    vector: {
      type: [Number],
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const formatSlugTimestamp = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
};

const buildUniqueProductSlug = (name: string) => {
  return `${toSlug(name || "product")}-${formatSlugTimestamp()}`;
};

// Create slug from name
productSchema.pre("save", function (next) {
  if (this.isNew && (this.isModified("name") || !this.slug)) {
    this.slug = buildUniqueProductSlug(this.name);
  } else if (!this.slug) {
    this.slug = toSlug(this.name);
  }
  next();
});

// Validate slug is present
productSchema.pre("validate", function (next) {
  if (!this.slug) {
    this.slug = this.isNew
      ? buildUniqueProductSlug(this.name)
      : toSlug(this.name);
  }
  next();
});

// Add text index for search
productSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
  tags: "text",
  "attributes.name": "text",
  "attributes.value": "text",
});

// Add indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ slug: 1 });
productSchema.index(
  { "source.provider": 1, "source.groupKey": 1 },
  {
    unique: true,
    sparse: true,
  },
);

// Index for variants
productSchema.index({ "variants.color": 1 });
productSchema.index({ "variants.storage": 1 });
productSchema.index({ "variants.price": 1 });

export const Product = mongoose.model<IProduct>("Product", productSchema);
