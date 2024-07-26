// 에러 클래스 정의
class NotFoundError extends Error {
  constructor(message) {
      super(message);
      this.name = "NotFoundError";
      this.statusCode = 404;
  }
}

class DuplicateProductError extends Error {
  constructor(message) {
      super(message);
      this.name = "DuplicateProductError";
      this.statusCode = 409;
  }
}

class ValidationError extends Error {
  constructor(message) {
      super(message);
      this.name = "ValidationError";
      this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
      super(message);
      this.name = "UnauthorizedError";
      this.statusCode = 401;
  }
}

// 에러 처리 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof NotFoundError || err instanceof DuplicateProductError || 
      err instanceof ValidationError || err instanceof UnauthorizedError) {
      return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.' });
};

export { NotFoundError, DuplicateProductError, ValidationError, UnauthorizedError, errorHandler };
