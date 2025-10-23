import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../constants/common";
import mongoose from "mongoose";

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
  model: mongoose.Model<T>,
  options: {
    page: number;
    limit: number;
    filter?: any;
    sort?: any;
    populate?: any[];
    select?: string
  }
) => {
  const { page, limit, filter = {}, sort = {}, populate = [], select } = options;
  const skip = (page - 1) * limit;

  const query = model
    .find(filter, select, { lean: true, strictQuery: true })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (populate.length > 0) {
    populate.forEach((pop) => {
      query.populate(pop);
    }); 
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter, { strictQuery: true }),
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
