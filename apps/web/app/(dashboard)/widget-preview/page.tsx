import type { Metadata } from "next";
import { WidgetPreview } from "./widget-preview-client";

export const metadata: Metadata = { title: "Widget Preview" };

export default function WidgetPreviewPage() {
  return <WidgetPreview />;
}
