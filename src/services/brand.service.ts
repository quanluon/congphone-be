import { Brand, IBrand } from '../../layers/common/nodejs/models/brand.model';
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
    const { search, isActive } = query;
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

    const brands = await Brand.find(filter)
      .sort({ name: 1 });

    return {
      data: brands,
      total: brands.length
    };
  }

  async getAllActiveBrands(): Promise<IBrand[]> {
    return await Brand.find({ isActive: true }).sort({ name: 1 });
  }
}

export const brandService = new BrandService();
