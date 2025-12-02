import type { IHeaderParams } from "ag-grid-community";
import { useEffect, useRef, useState } from "react";
import checklistData from "../checklist.json";
import { extractLinkFields } from "../utils/dataHelpers";

const ROLE_FIELD_ID = "296495";

type LinkColumnHeaderParams = IHeaderParams;

export function LinkColumnHeader(params: LinkColumnHeaderParams) {
  const {
    displayName,
    column,
    enableMenu,
    enableSorting,
    showColumnMenu,
    progressSort,
  } = params;
  const fieldId = column.getColId();
  const field = checklistData.fields.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f: any) => String(f.id) === fieldId
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldType = field ? (field as any).type : null;
  const linkFields = extractLinkFields(fieldType);
  const hasFields = linkFields.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | null | undefined
  >(column.getSort() as "asc" | "desc" | null | undefined);
  const [isFilterActive, setIsFilterActive] = useState(column.isFilterActive());
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleExpansionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.fieldId === fieldId) {
        setIsExpanded(customEvent.detail?.isExpanded ?? false);
      }
    };

    window.addEventListener("columnExpansionChanged", handleExpansionChange);
    return () => {
      window.removeEventListener(
        "columnExpansionChanged",
        handleExpansionChange
      );
    };
  }, [fieldId]);

  useEffect(() => {
    const handleSortChanged = () => {
      setSortDirection(column.getSort() as "asc" | "desc" | null | undefined);
    };
    column.addEventListener("sortChanged", handleSortChanged);
    return () => {
      column.removeEventListener("sortChanged", handleSortChanged);
    };
  }, [column]);

  useEffect(() => {
    const handleFilterChanged = () => {
      setIsFilterActive(column.isFilterActive());
    };
    column.addEventListener("filterChanged", handleFilterChanged);
    return () => {
      column.removeEventListener("filterChanged", handleFilterChanged);
    };
  }, [column]);

  const handleToggle = () => {
    // This will be handled by the parent component
    const event = new CustomEvent("toggleNestedColumns", {
      detail: { fieldId, linkFields, isExpanded },
    });
    window.dispatchEvent(event);
  };

  const handleHeaderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableSorting) return;
    if ((event.target as HTMLElement).closest("button")) return;
    progressSort(event.shiftKey);
  };

  const handleSortButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    if (!enableSorting) return;
    progressSort(event.shiftKey);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!enableMenu || !menuButtonRef.current) return;
    showColumnMenu(menuButtonRef.current);
  };

  const handleFilterButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    const columnMenuApi = column as unknown as {
      getMenuTabs?: () => string[] | undefined;
      setMenuTabs?: (menuTabs?: string[]) => void;
    };
    const originalMenuTabs = columnMenuApi.getMenuTabs?.();
    columnMenuApi.setMenuTabs?.(["filterMenuTab"]);
    showColumnMenu(filterButtonRef.current, () => {});
    window.setTimeout(() => {
      columnMenuApi.setMenuTabs?.(originalMenuTabs);
    }, 0);
  };

  const getSortIcon = () => {
    if (!enableSorting) return null;
    if (sortDirection === "asc") return "↑";
    if (sortDirection === "desc") return "↓";
    return "↕";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "13px",
      }}
      onClick={handleHeaderClick}
    >
      <span
        style={{
          cursor: enableSorting ? "pointer" : "default",
          fontWeight: 600,
        }}
      >
        {displayName}
      </span>
      {enableSorting && (
        <button
          onClick={handleSortButtonClick}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "12px",
            padding: "0 2px",
            lineHeight: 1,
          }}
          title="Toggle sort order"
        >
          {getSortIcon()}
        </button>
      )}
      <button
        ref={filterButtonRef}
        onClick={handleFilterButtonClick}
        style={{
          border: "1px solid #ccc",
          background: isFilterActive ? "#1976d2" : "#f5f5f5",
          color: isFilterActive ? "#fff" : "#333",
          cursor: "pointer",
          fontSize: "11px",
          padding: "2px 6px",
          lineHeight: 1,
          borderRadius: "3px",
          fontWeight: "500",
        }}
        title="Filter column"
      >
        🔍
      </button>
      {isFilterActive && (
        <span
          title="Filter applied"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#ff9800",
            display: "inline-block",
          }}
        />
      )}
      {enableMenu && (
        <button
          ref={menuButtonRef}
          onClick={handleMenuClick}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
            padding: "0 2px",
            lineHeight: 1,
          }}
          title="Column options"
        >
          ⋮
        </button>
      )}
      {hasFields && fieldId === ROLE_FIELD_ID && (
        <button
          onClick={handleToggle}
          style={{
            padding: "2px 6px",
            fontSize: "12px",
            cursor: "pointer",
            border: "1px solid #2196f3",
            borderRadius: "3px",
            background: isExpanded ? "#4caf50" : "#e3f2fd",
            color: isExpanded ? "#fff" : "#1976d2",
            fontWeight: "bold",
            minWidth: "20px",
          }}
          title={
            isExpanded
              ? "Collapse nested columns"
              : "Expand to show nested columns"
          }
        >
          {isExpanded ? "−" : "+"}
        </button>
      )}
    </div>
  );
}
