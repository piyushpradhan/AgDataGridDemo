import { extractTitleOrDisplayName } from "./dataHelpers";

export function formatLinkValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (Array.isArray(value)) {
    return value
      .map((item) => formatLinkValue(item))
      .filter((item): item is string => Boolean(item))
      .join(", ");
  }

  if (typeof value === "object") {
    const extracted = extractTitleOrDisplayName(value);
    if (extracted) return extracted;

    const record = value as Record<string, unknown>;
    if (typeof record.address === "string") return record.address;
    if (record.id) return String(record.id);

    return JSON.stringify(value).substring(0, 80);
  }

  if (typeof value === "string") return value;

  return String(value);
}
