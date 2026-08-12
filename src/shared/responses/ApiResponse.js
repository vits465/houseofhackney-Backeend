class ApiResponse {
  constructor(res, statusCode, message, data = null, errors = null) {
    this.res = res;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  send() {
    return this.res.status(this.statusCode).json({
      success: this.statusCode >= 200 && this.statusCode < 300,
      message: this.message,
      data: this.data,
      errors: this.errors,
    });
  }
}

export default ApiResponse;
