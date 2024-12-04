const ErrorResponse = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Cosmos DB errors
  if (err.code === 404) {
    error = new ErrorResponse('Resource not found', 404);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  // Tratamento de erro para autenticação falha
  if (err.message === 'Invalid credentials') {
    error = new ErrorResponse('Invalid email or password', 401);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export { ErrorResponse, errorHandler };