export * from "./schema";
export * from "./relations";
export * from "./client";

// Re-export drizzle operators so app code uses the same drizzle-orm instance
export { eq, and, or, not, count, asc, desc, inArray, isNull, isNotNull, sql, gte, lte, gt, lt, ne, like, ilike } from "drizzle-orm";
