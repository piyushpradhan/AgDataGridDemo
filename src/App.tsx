import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type {
  CellClassParams,
  ColDef,
  GridApi,
  IRowNode,
  ValueGetterParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./App.css";
import nestedData from "./emb-data.json";
import checklistData from "./checklist.json";
import tableData from "./data.json";
import {
  extractTitleOrDisplayName,
  extractLinkFields,
} from "./utils/dataHelpers";
import { LinkColumnHeader } from "./components/LinkColumnHeader";
import { LinkCellRenderer } from "./components/LinkCellRenderer";
import { formatLinkValue } from "./utils/linkValueFormatter";
import { ColumnManagementMenu } from "./components/ColumnManagementMenu";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

function App() {
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set()
  );

  // Helper function to create a column definition for any field
  const createColumnDef = useCallback(
    (
      fieldName: string,
      headerName: string,
      options?: {
        headerClass?: string;
        cellClass?: string;
      }
    ): ColDef => {
      return {
        field: fieldName,
        headerName: headerName,
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        minWidth: 150,
        headerClass: options?.headerClass,
        cellClass: options?.cellClass,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valueGetter: (params: any) => {
          const nested = [296493, 296494, 296496];
          let value = params.data?.[fieldName];
          if (nested.includes(Number(fieldName))) {
            console.log(params.data?.[296495]);
            value = params.data?.[296495]?.[0]?.chatroom[fieldName];
          }
          if (value === null || value === undefined) return "-";

          // Handle arrays
          if (Array.isArray(value)) {
            if (value.length === 0) return "-";

            // If array contains objects, extract title/displayName from each
            if (typeof value[0] === "object" && value[0] !== null) {
              const results = value
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any) => {
                  const extracted = extractTitleOrDisplayName(item);
                  if (extracted) return extracted;
                  if (item?.address) return item.address;
                  return JSON.stringify(item).substring(0, 100);
                })
                .filter((v: string) => v);

              return results.length > 0 ? results.join(", ") : "-";
            }

            return value.map(String).join(", ");
          }

          // Handle objects
          if (typeof value === "object" && value !== null) {
            const extracted = extractTitleOrDisplayName(value);
            if (extracted) return extracted;
            if (value.address) return value.address;
            if (value.id) return String(value.id);
            return JSON.stringify(value).substring(0, 200);
          }

          // Handle primitives
          return String(value);
        },
      };
    },
    []
  );

  // Create column definitions from checklist fields
  const [columnDefs, setColumnDefs] = useState<ColDef[]>(() => {
    // Title column (fixed/pinned at the beginning)
    const titleColumn: ColDef = {
      field: "title",
      headerName: "Title",
      pinned: "left",
      sortable: true,
      filter: true,
      resizable: true,
      width: 200,
      minWidth: 150,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueGetter: (params: any) => {
        return params.data?.title || "-";
      },
    };

    // Other columns from checklist fields
    const otherColumns = [...checklistData.fields, ...nestedData]
      .filter((field) => field.config?.label) // Only include fields with labels
      .map((field) => {
        // Check if field type is "link"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldType = (field as any).type;
        const isLinkType =
          fieldType &&
          (typeof fieldType === "string"
            ? fieldType.includes("link") || fieldType.includes('"~#link"')
            : JSON.stringify(fieldType).includes("link"));

        const linkFields = isLinkType ? extractLinkFields(fieldType) : [];

        const getFormattedValueFromRow = (
          rowData?: Record<string, unknown>
        ): string => {
          const nestedIds = [296493, 296494, 296496];

          if (!rowData) return "-";

          let value = rowData[String(field.id)];
          if (
            isLinkType &&
            nestedIds.includes(Number(field.id)) &&
            typeof rowData.title === "string" &&
            rowData.title.includes("test schedule of audit - 2024-10-29")
          ) {
            value = rowData["296495"];
          }

          if (isLinkType) {
            const formatted = formatLinkValue(value);
            return formatted ?? "-";
          }

          if (value === null || value === undefined) return "-";

          if (Array.isArray(value)) {
            if (value.length === 0) return "-";

            if (typeof value[0] === "object" && value[0] !== null) {
              const results = value
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any) => {
                  const extracted = extractTitleOrDisplayName(item);
                  if (extracted) return extracted;
                  if (item?.address) return item.address;
                  return JSON.stringify(item).substring(0, 100);
                })
                .filter((v: string) => v);

              return results.length > 0 ? results.join(", ") : "-";
            }

            return value.map(String).join(", ");
          }

          if (typeof value === "object" && value !== null) {
            if (field.id.toString() === "296493") {
              console.log("coming here");
            }
            const extracted = extractTitleOrDisplayName(value);
            if (extracted) return extracted;

            const recordValue = value as Record<string, unknown>;
            if (typeof recordValue.address === "string")
              return recordValue.address;
            if (recordValue.id !== undefined) return String(recordValue.id);

            return JSON.stringify(value).substring(0, 200);
          }

          return String(value);
        };

        const columnValueGetter = (
          params: ValueGetterParams<Record<string, unknown>>
        ): string => {
          const nested = [296493, 296494, 296496];
          const data = nested.includes(Number(params.column.getColDef().field))
            ? params.data?.[296495]
            : params.data;

          return getFormattedValueFromRow(data as Record<string, unknown>);
        };

        return {
          field: String(field.id), // Use field ID as the field name
          headerName: field.config.label,
          sortable: true,
          filter: true,
          resizable: true,
          flex: 1,
          minWidth: 200,
          enableMenu: true,
          // Add CSS classes for link columns
          cellClass: isLinkType
            ? (params: CellClassParams) => {
                const formatted = getFormattedValueFromRow(
                  (params.data as Record<string, unknown> | undefined) ??
                    undefined
                );
                return formatted && formatted !== "-"
                  ? "link-column-cell"
                  : undefined;
              }
            : undefined,
          headerClass: isLinkType ? "link-column-header" : undefined,
          cellRenderer: isLinkType ? LinkCellRenderer : undefined,
          // Use custom header for link columns with fields
          headerComponent: isLinkType ? LinkColumnHeader : undefined,
          // Store metadata
          linkFields: isLinkType ? linkFields : undefined,
          originalFieldId: String(field.id),
          valueGetter: columnValueGetter,
          filterValueGetter: isLinkType
            ? (params: ValueGetterParams<Record<string, unknown>>) => {
                const nested = [296493, 296494, 296496];
                const data = nested.includes(
                  Number(params.column.getColDef().field)
                )
                  ? params.data?.[296495]
                  : params.data?.[params.column.getColDef().field ?? ""];
                return data === "-" ? "" : data;
              }
            : undefined,
          comparator: isLinkType
            ? (
                _valueA: string | null | undefined,
                _valueB: string | null | undefined,
                nodeA: IRowNode<Record<string, unknown>>,
                nodeB: IRowNode<Record<string, unknown>>
              ) => {
                const formattedA =
                  getFormattedValueFromRow(
                    nodeA?.data as Record<string, unknown> | undefined
                  ) || "";
                const formattedB =
                  getFormattedValueFromRow(
                    nodeB?.data as Record<string, unknown> | undefined
                  ) || "";
                return formattedA.localeCompare(formattedB);
              }
            : undefined,
        };
      });

    // Get extra attributes from data that are not in checklist
    const dataArray = Array.isArray(tableData) ? tableData : [];
    const checklistFieldIds = new Set(
      checklistData.fields.map((f) => String(f.id))
    );
    const allKeys = new Set<string>();

    // Collect all keys from first few rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataArray.slice(0, 10).forEach((row: any) => {
      Object.keys(row).forEach((k) => allKeys.add(k));
    });

    // Filter out checklist field IDs, meta fields, and title
    const extraAttributes = Array.from(allKeys).filter(
      (k) => !checklistFieldIds.has(k) && !k.endsWith("-meta") && k !== "title"
    );

    // Create columns for extra attributes
    const extraColumns = extraAttributes.map((attr) => {
      // Format header name: convert camelCase to Title Case
      const headerName = attr
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return createColumnDef(attr, headerName);
    });

    // Return title column first, then checklist columns, then extra columns
    return [titleColumn, ...otherColumns, ...extraColumns];
  });

  // Handle toggling nested columns (simple PoC for Role column)
  const handleToggleNestedColumns = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      if (!expandedColumns.has(event.detail.fieldId)) {
        setColumnDefs((prev) => {
          const indexOfLinkedColumn = prev.findIndex(
            (col) => col.field === event.detail.fieldId
          );
          const firstSlice = prev.slice(0, indexOfLinkedColumn + 1);
          const secondSlice = prev.slice(indexOfLinkedColumn + 1);
          const nestedColumns = event.detail.linkFields.map(
            (fieldId: number) => {
              const field = nestedData.find((col) => col.id === fieldId);
              return createColumnDef(
                String(fieldId),
                field?.type?.split('label":"')[1].split('"')[0] ?? "",
                {
                  headerClass: "nested-column-header",
                  cellClass: "nested-column-cell",
                }
              );
            }
          );
          setExpandedColumns((prev) => {
            const next = new Set(prev);
            next.add(event.detail.fieldId);
            return next;
          });
          return [...firstSlice, ...nestedColumns, ...secondSlice];
        });
      } else {
        setColumnDefs((prev) => {
          const indexOfLinkedColumn = prev.findIndex(
            (col) => col.field === event.detail.fieldId
          );
          const firstSlice = prev.slice(0, indexOfLinkedColumn + 1);
          const secondSlice = prev.slice(
            indexOfLinkedColumn + event.detail.linkFields.length + 1
          );
          return [...firstSlice, ...secondSlice];
        });
        setExpandedColumns((prev) => {
          const next = new Set(prev);
          next.delete(event.detail.fieldId);
          return next;
        });
      }
    },
    [expandedColumns, createColumnDef]
  );

  // Listen for toggle events
  useEffect(() => {
    window.addEventListener("toggleNestedColumns", handleToggleNestedColumns);
    return () => {
      window.removeEventListener(
        "toggleNestedColumns",
        handleToggleNestedColumns
      );
    };
  }, [handleToggleNestedColumns]);

  // Transform data to ensure all field IDs are present as keys
  const rowData = useMemo(() => {
    const dataArray = Array.isArray(tableData) ? tableData : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dataArray.map((row: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedRow: any = { ...row };

      // Ensure all field IDs from checklist are present
      checklistData.fields.forEach((field) => {
        const fieldId = String(field.id);
        if (!(fieldId in transformedRow)) {
          transformedRow[fieldId] = null;
        }
      });

      return transformedRow;
    });
  }, []);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ColumnManagementMenu
        columnDefs={columnDefs}
        setColumnDefs={setColumnDefs}
        gridApi={gridApi}
      />
      <div className="ag-theme-alpine" style={{ flexGrow: 1, width: "100%" }}>
        <AgGridReact
          ref={(grid) => {
            if (grid?.api) {
              gridApiRef.current = grid.api;
              setGridApi(grid.api);
            }
          }}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
        />
      </div>
    </div>
  );
}

export default App;
