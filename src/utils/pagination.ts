import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/common";
import { Model, Document } from "mongoose";

export const getPagination = (
  {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  }: {
    page?: number;
    limit?: number;
  } = {
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
  }
) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

export const getPaginationResponse = <T>(
  data: T[],
  {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  }: {
    page?: number;
    limit?: number;
    total?: number;
  },
  total = 0
) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const paginate = async <T>(
  model: any,
  options: {
    page: number;
    limit: number;
    filter?: any;
    sort?: any;
    populate?: any[];
  }
) => {
  const { page, limit, filter = {}, sort = {}, populate = [] } = options;
  const skip = (page - 1) * limit;

  const query = model.find(filter).sort(sort).skip(skip).limit(limit);
  
  if (populate.length > 0) {
    populate.forEach((pop) => {
      query.populate(pop);
    });
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
