import mongoose from "mongoose";

export interface ISanitizedProviderOffer {
  provider: string;
  productId?: mongoose.Types.ObjectId;
  productSlug?: string;
  productName: string;
  sourceGroupKey: string;
  canonicalUrl: string;
  memberUrls: string[];
  basePrice: number;
  originalBasePrice?: number | null;
  variantCount: number;
  colors: string[];
  storages: string[];
  sizes: string[];
  lastCrawledAt?: Date;
  updatedAt: Date;
}

export interface ISanitizedProduct {
  _id?: mongoose.Types.ObjectId;
  compareKey: string;
  normalizedName: string;
  displayName: string;
  brandName: string;
  productType: string;
  categoryKey: string;
  categorySlug: string;
  providerOffers: ISanitizedProviderOffer[];
  lowestPrice: number;
  highestPrice: number;
  providerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizedProviderOfferSchema = new mongoose.Schema<ISanitizedProviderOffer>(
  {
    provider: { type: String, required: true, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productSlug: { type: String, trim: true },
    productName: { type: String, required: true, trim: true },
    sourceGroupKey: { type: String, required: true, trim: true },
    canonicalUrl: { type: String, required: true, trim: true },
    memberUrls: [{ type: String, trim: true }],
    basePrice: { type: Number, required: true, min: 0 },
    originalBasePrice: { type: Number, min: 0, default: null },
    variantCount: { type: Number, required: true, min: 0 },
    colors: [{ type: String, trim: true }],
    storages: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }],
    lastCrawledAt: { type: Date },
    updatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const sanitizedProductSchema = new mongoose.Schema<ISanitizedProduct>(
  {
    compareKey: { type: String, required: true, unique: true, trim: true, index: true },
    normalizedName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    productType: { type: String, required: true, trim: true, index: true },
    categoryKey: { type: String, required: true, trim: true },
    categorySlug: { type: String, required: true, trim: true, index: true },
    providerOffers: [sanitizedProviderOfferSchema],
    lowestPrice: { type: Number, required: true, min: 0 },
    highestPrice: { type: Number, required: true, min: 0 },
    providerCount: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    collection: "sanitized_products",
  },
);

sanitizedProductSchema.index({ productType: 1, categorySlug: 1 });
sanitizedProductSchema.index({ brandName: 1, normalizedName: 1 });
sanitizedProductSchema.index({ "providerOffers.provider": 1 });

export const SanitizedProduct = mongoose.model<ISanitizedProduct>(
  "SanitizedProduct",
  sanitizedProductSchema,
);
