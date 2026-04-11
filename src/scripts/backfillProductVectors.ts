import mongoose from "mongoose";
import "../config/env";

import connectToDatabase from "../config/database";
import { Product } from "../models/product.model";
import { ProductService } from "../services/product.service";
import logger from "../utils/logger";

async function backfillProductVectors() {
  const productService = new ProductService();

  try {
    await connectToDatabase();
    logger.info("Connected to database");

    const products = await Product.find({})
      .select("_id name updatedAt")
      .sort({ updatedAt: -1 })
      .lean<Array<{ _id: mongoose.Types.ObjectId; name: string }>>();

    logger.info({ count: products.length }, "Starting product vector backfill");

    let successCount = 0;
    let failureCount = 0;

    for (const product of products) {
      try {
        await productService.refreshProductVector(product._id.toString());
        successCount += 1;

        logger.info(
          {
            productId: product._id.toString(),
            name: product.name,
            progress: `${successCount + failureCount}/${products.length}`,
          },
          "Backfilled product vector",
        );
      } catch (error) {
        failureCount += 1;

        logger.error(
          {
            err: error,
            productId: product._id.toString(),
            name: product.name,
            progress: `${successCount + failureCount}/${products.length}`,
          },
          "Failed to backfill product vector",
        );
      }
    }

    logger.info(
      {
        total: products.length,
        successCount,
        failureCount,
      },
      "Product vector backfill completed",
    );
  } catch (error) {
    logger.error({ err: error }, "Error backfilling product vectors");
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    logger.info("Database connection closed");
  }
}

backfillProductVectors();
