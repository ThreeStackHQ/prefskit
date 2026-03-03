import type { Metadata } from "next";
import { CategoriesManager } from "./categories-manager";

export const metadata: Metadata = { title: "Categories" };

// TODO: Fetch from GET /api/categories once Bolt's API is ready
async function getCategories() {
  // Stub data — replace with real API call
  return [
    {
      id: "1",
      slug: "marketing",
      label: "Marketing & Announcements",
      description: "Product launches, company news, and special offers",
      required: false,
      order: 0,
    },
    {
      id: "2",
      slug: "product-updates",
      label: "Product Updates",
      description: "New features, improvements, and changelogs",
      required: false,
      order: 1,
    },
    {
      id: "3",
      slug: "transactional",
      label: "Transactional",
      description: "Account notifications, receipts, and security alerts",
      required: true,
      order: 2,
    },
  ];
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return <CategoriesManager initialCategories={categories} />;
}
