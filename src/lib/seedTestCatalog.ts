import { Connection } from "mongoose";
import { getTestCategoryModel } from "@/models/TestCategory";
import defaultCatalog from "@/data/TestCategory";

/**
 * Seeds a tenant's test catalog from the built-in default on first use.
 * Idempotent - does nothing if the tenant already has any categories,
 * so it's safe to call unconditionally (e.g. on every org creation).
 */
export async function seedTestCatalog(connection: Connection): Promise<void> {
  const TestCategory = getTestCategoryModel(connection);
  const count = await TestCategory.countDocuments();
  if (count > 0) return;

  await TestCategory.insertMany(defaultCatalog as any[]);
}
