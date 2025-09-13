export const MESSAGES = {
  en: {
    // Common messages
    success: "Success",
    error: "Error",
    notFound: "Not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    internalError: "Internal server error",
    validationError: "Validation error",
    
    // Authentication
    loginSuccess: "Login successful",
    loginFailed: "Login failed",
    logoutSuccess: "Logout successful",
    tokenExpired: "Token expired",
    invalidCredentials: "Invalid credentials",
    userNotFound: "User not found",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    emailInvalid: "Invalid email format",
    passwordTooShort: "Password must be at least 6 characters",
    tokenRequired: "Authorization token required",
    invalidToken: "Invalid token",
    authenticationFailed: "Authentication failed",
    userExists: "User already exists",
    userCreationFailed: "Failed to create user",
    userRegistrationFailed: "Failed to register user",
    passwordChangeRequired: "Password change required",
    userNotConfirmed: "User not confirmed",
    tokenRefreshFailed: "Token refresh failed",
    invalidRefreshToken: "Invalid refresh token",
    passwordResetFailed: "Failed to reset password",
    tooManyRequests: "Too many requests",
    invalidConfirmationCode: "Invalid confirmation code",
    confirmationCodeExpired: "Confirmation code expired",
    invalidPasswordFormat: "Invalid password format",
    getUserFailed: "Failed to get user",
    updateUserFailed: "Failed to update user",
    deleteUserFailed: "Failed to delete user",
    updateProfileFailed: "Failed to update profile",
    deactivateUserFailed: "Failed to deactivate user",
    getUsersFailed: "Failed to get users",
    adminAccessRequired: "Admin access required",
    customerAccessRequired: "Customer access required",
    
    // Products
    productNotFound: "Product not found",
    productCreated: "Product created successfully",
    productUpdated: "Product updated successfully",
    productDeleted: "Product deleted successfully",
    productVariantNotFound: "Product variant not found",
    insufficientStock: "Insufficient stock",
    invalidProductType: "Invalid product type",
    
    // Categories
    categoryNotFound: "Category not found",
    categoryCreated: "Category created successfully",
    categoryUpdated: "Category updated successfully",
    categoryDeleted: "Category deleted successfully",
    categoryNameRequired: "Category name is required",
    
    // Brands
    brandNotFound: "Brand not found",
    brandCreated: "Brand created successfully",
    brandUpdated: "Brand updated successfully",
    brandDeleted: "Brand deleted successfully",
    brandNameRequired: "Brand name is required",
    
    // File Upload
    fileUploadSuccess: "File uploaded successfully",
    fileDeleteSuccess: "File deleted successfully",
    fileNotFound: "File not found",
    fileTypeInvalid: "Invalid file type. Only images and documents are allowed",
    fileSizeExceeded: "File size exceeds 10MB limit",
    fileNameRequired: "File name is required",
    fileTypeRequired: "File type is required",
    fileKeyRequired: "File key is required",
    maxFilesExceeded: "Maximum 5 files allowed per request",
    filesArrayRequired: "Files array is required",
    
    // Validation
    required: "This field is required",
    email: "Please enter a valid email",
    minLength: "Minimum length is {min} characters",
    maxLength: "Maximum length is {max} characters",
    min: "Minimum value is {min}",
    max: "Maximum value is {max}",
    numeric: "Must be a number",
    integer: "Must be an integer",
    positive: "Must be a positive number",
    url: "Must be a valid URL",
    date: "Must be a valid date",
    
    // Search
    searchQueryRequired: "Search query is required",
    noResultsFound: "No results found",
    
    // Pagination
    invalidPage: "Invalid page number",
    invalidLimit: "Invalid limit",
    
    // General
    operationSuccess: "Operation completed successfully",
    operationFailed: "Operation failed",
    dataNotFound: "Data not found",
    accessDenied: "Access denied",
    serverError: "Server error occurred",
  },
  
  vi: {
    // Common messages
    success: "Thành công",
    error: "Lỗi",
    notFound: "Không tìm thấy",
    unauthorized: "Không có quyền truy cập",
    forbidden: "Bị cấm",
    badRequest: "Yêu cầu không hợp lệ",
    internalError: "Lỗi máy chủ nội bộ",
    validationError: "Lỗi xác thực",
    
    // Authentication
    loginSuccess: "Đăng nhập thành công",
    loginFailed: "Đăng nhập thất bại",
    logoutSuccess: "Đăng xuất thành công",
    tokenExpired: "Token đã hết hạn",
    invalidCredentials: "Thông tin đăng nhập không hợp lệ",
    userNotFound: "Không tìm thấy người dùng",
    emailRequired: "Email là bắt buộc",
    passwordRequired: "Mật khẩu là bắt buộc",
    emailInvalid: "Định dạng email không hợp lệ",
    passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự",
    tokenRequired: "Token xác thực là bắt buộc",
    invalidToken: "Token không hợp lệ",
    authenticationFailed: "Xác thực thất bại",
    userExists: "Người dùng đã tồn tại",
    userCreationFailed: "Tạo người dùng thất bại",
    userRegistrationFailed: "Đăng ký người dùng thất bại",
    passwordChangeRequired: "Yêu cầu thay đổi mật khẩu",
    userNotConfirmed: "Người dùng chưa được xác nhận",
    tokenRefreshFailed: "Làm mới token thất bại",
    invalidRefreshToken: "Token làm mới không hợp lệ",
    passwordResetFailed: "Đặt lại mật khẩu thất bại",
    tooManyRequests: "Quá nhiều yêu cầu",
    invalidConfirmationCode: "Mã xác nhận không hợp lệ",
    confirmationCodeExpired: "Mã xác nhận đã hết hạn",
    invalidPasswordFormat: "Định dạng mật khẩu không hợp lệ",
    getUserFailed: "Lấy thông tin người dùng thất bại",
    updateUserFailed: "Cập nhật người dùng thất bại",
    deleteUserFailed: "Xóa người dùng thất bại",
    updateProfileFailed: "Cập nhật hồ sơ thất bại",
    deactivateUserFailed: "Vô hiệu hóa người dùng thất bại",
    getUsersFailed: "Lấy danh sách người dùng thất bại",
    adminAccessRequired: "Yêu cầu quyền quản trị",
    customerAccessRequired: "Yêu cầu quyền khách hàng",
    
    // Products
    productNotFound: "Không tìm thấy sản phẩm",
    productCreated: "Tạo sản phẩm thành công",
    productUpdated: "Cập nhật sản phẩm thành công",
    productDeleted: "Xóa sản phẩm thành công",
    productVariantNotFound: "Không tìm thấy biến thể sản phẩm",
    insufficientStock: "Không đủ hàng trong kho",
    invalidProductType: "Loại sản phẩm không hợp lệ",
    
    // Categories
    categoryNotFound: "Không tìm thấy danh mục",
    categoryCreated: "Tạo danh mục thành công",
    categoryUpdated: "Cập nhật danh mục thành công",
    categoryDeleted: "Xóa danh mục thành công",
    categoryNameRequired: "Tên danh mục là bắt buộc",
    
    // Brands
    brandNotFound: "Không tìm thấy thương hiệu",
    brandCreated: "Tạo thương hiệu thành công",
    brandUpdated: "Cập nhật thương hiệu thành công",
    brandDeleted: "Xóa thương hiệu thành công",
    brandNameRequired: "Tên thương hiệu là bắt buộc",
    
    // File Upload
    fileUploadSuccess: "Tải file thành công",
    fileDeleteSuccess: "Xóa file thành công",
    fileNotFound: "Không tìm thấy file",
    fileTypeInvalid: "Loại file không hợp lệ. Chỉ cho phép hình ảnh và tài liệu",
    fileSizeExceeded: "Kích thước file vượt quá 10MB",
    fileNameRequired: "Tên file là bắt buộc",
    fileTypeRequired: "Loại file là bắt buộc",
    fileKeyRequired: "Khóa file là bắt buộc",
    maxFilesExceeded: "Tối đa 5 file mỗi lần yêu cầu",
    filesArrayRequired: "Mảng file là bắt buộc",
    
    // Validation
    required: "Trường này là bắt buộc",
    email: "Vui lòng nhập email hợp lệ",
    minLength: "Độ dài tối thiểu là {min} ký tự",
    maxLength: "Độ dài tối đa là {max} ký tự",
    min: "Giá trị tối thiểu là {min}",
    max: "Giá trị tối đa là {max}",
    numeric: "Phải là số",
    integer: "Phải là số nguyên",
    positive: "Phải là số dương",
    url: "Phải là URL hợp lệ",
    date: "Phải là ngày hợp lệ",
    
    // Search
    searchQueryRequired: "Từ khóa tìm kiếm là bắt buộc",
    noResultsFound: "Không tìm thấy kết quả",
    
    // Pagination
    invalidPage: "Số trang không hợp lệ",
    invalidLimit: "Giới hạn không hợp lệ",
    
    // General
    operationSuccess: "Thao tác hoàn thành thành công",
    operationFailed: "Thao tác thất bại",
    dataNotFound: "Không tìm thấy dữ liệu",
    accessDenied: "Truy cập bị từ chối",
    serverError: "Đã xảy ra lỗi máy chủ",
  }
};

export type Language = keyof typeof MESSAGES;
export type MessageKey = keyof typeof MESSAGES.en;