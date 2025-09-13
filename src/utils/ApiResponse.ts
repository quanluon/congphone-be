export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MetaData {
  [key: string]: any;
}

export class ApiResponse {
  private success: boolean;
  private data: any;
  private message?: string;
  private pagination?: PaginationData;
  private meta?: MetaData;

  constructor(success: boolean, data: any = null, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  public static success(data: any = null, message?: string): ApiResponse {
    return new ApiResponse(true, data, message);
  }

  public static error(message: string, data: any = null): ApiResponse {
    return new ApiResponse(false, data, message);
  }

  public withPagination(pagination: PaginationData): ApiResponse {
    this.pagination = pagination;
    return this;
  }

  public withMeta(meta: MetaData): ApiResponse {
    this.meta = meta;
    return this;
  }

  public build(): Record<string, any> {
    const response: Record<string, any> = {
      success: this.success,
      data: this.data,
    };

    if (this.message) {
      response.message = this.message;
    }

    if (this.pagination) {
      response.pagination = this.pagination;
    }

    if (this.meta) {
      response.meta = this.meta;
    }

    return response;
  }
}

// Error response helper
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: any = null,
    public messageKey?: string // Add message key for translation
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
