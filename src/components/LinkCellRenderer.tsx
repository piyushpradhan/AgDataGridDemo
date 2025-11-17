import type { ICellRendererParams } from "ag-grid-community";
import { formatLinkValue } from "../utils/linkValueFormatter";

interface LinkCellRendererProps extends ICellRendererParams {
  value: unknown;
}

export function LinkCellRenderer(props: LinkCellRendererProps) {
  const { value, data, colDef } = props;
  const field = colDef?.field ?? "";
  const rawValue =
    value ?? (data ? (data as Record<string, unknown>)[field] : null);

  if (!rawValue) {
    return <span className="link-cell-empty">-</span>;
  }

  const chips =
    Array.isArray(rawValue) && rawValue.length > 0
      ? rawValue
          .map((item, index) => {
            const formatted = formatLinkValue(item);
            if (!formatted || formatted === "-") return null;
            return (
              <span key={`${field}-${index}`} className="link-chip">
                {formatted}
              </span>
            );
          })
          .filter(Boolean)
      : null;

  if (chips && chips.length > 0) {
    return <div className="link-chip-container">{chips}</div>;
  }

  const formatted = formatLinkValue(rawValue);
  if (!formatted || formatted === "-") {
    return <span className="link-cell-empty">-</span>;
  }

  return <span className="link-chip">{formatted}</span>;
}
