import { Brand, IBrand } from '../models/brand.model';
import { ApiError } from '../utils/ApiResponse';

export class BrandService {
  async createBrand(brandData: Partial<IBrand>): Promise<IBrand> {
    const brand = new Brand(brandData);
    return await brand.save();
  }

  async getBrandById(id: string): Promise<IBrand | null> {
    return await Brand.findById(id);
  }

  async updateBrand(id: string, updateData: Partial<IBrand>): Promise<IBrand | null> {
    return await Brand.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteBrand(id: string): Promise<IBrand | null> {
    return await Brand.findByIdAndDelete(id);
  }

  async listBrands(query: any = {}) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [brands, total] = await Promise.all([
      Brand.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Brand.countDocuments(filter)
    ]);

    return {
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllActiveBrands(): Promise<IBrand[]> {
    return await Brand.find({ isActive: true }).sort({ name: 1 });
  }
}

export const brandService = new BrandService();
