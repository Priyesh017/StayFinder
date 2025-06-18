import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  // Prisma errors
  if (error.code === "P2002") {
    res.status(400).json({
      success: false,
      message: "A record with this information already exists",
      error: "Duplicate entry",
    });
    return;
  }

  if (error.code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Record not found",
      error: "Not found",
    });
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Authentication failed",
    });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
      error: "Authentication failed",
    });
    return;
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    error:
      process.env.NODE_ENV === "development" ? error.stack : "Server error",
  });
};
