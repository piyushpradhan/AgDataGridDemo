import { useState, useCallback, useEffect } from "react";
import type { ColDef, GridApi } from "ag-grid-community";

interface ColumnManagementMenuProps {
  columnDefs: ColDef[];
  setColumnDefs: React.Dispatch<React.SetStateAction<ColDef[]>>;
  gridApi: GridApi | null;
}

export function ColumnManagementMenu({
  columnDefs,
  setColumnDefs,
  gridApi,
}: ColumnManagementMenuProps) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Handle column visibility toggle
  const toggleColumnVisibility = useCallback(
    (field: string) => {
      const updatedColumns = columnDefs.map((col) => {
        if (col.field === field) {
          return { ...col, hide: !col.hide };
        }
        return col;
      });

      setColumnDefs(updatedColumns);
      if (gridApi) {
        gridApi.setGridOption("columnDefs", updatedColumns);
        // Update column visibility using setColumnsVisible
        const column = gridApi.getColumn(field);
        if (column) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gridApi.setColumnsVisible([column], !column.isVisible());
        }
      }
    },
    [columnDefs, gridApi, setColumnDefs]
  );

  // Handle drag and drop
  const handleDragStart = useCallback(
    (index: number) => {
      const col = columnDefs[index];
      // Don't allow dragging title or pinned columns
      if (col.field === "title" || col.pinned) return;
      setDraggedColumnIndex(index);
    },
    [columnDefs]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const col = columnDefs[index];
      // Don't allow dropping on title or pinned columns
      if (col.field === "title" || col.pinned) return;
      if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [columnDefs, draggedColumnIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      setDragOverIndex(null);

      if (draggedColumnIndex === null) return;

      const col = columnDefs[dropIndex];
      // Don't allow dropping on title or pinned columns
      if (col.field === "title" || col.pinned) return;

      // Don't allow moving title column
      if (columnDefs[draggedColumnIndex].field === "title") return;

      // Don't allow moving pinned columns
      if (columnDefs[draggedColumnIndex].pinned) return;

      // Ensure we don't move before title column
      const titleIndex = columnDefs.findIndex((c) => c.field === "title");
      const minIndex = titleIndex >= 0 ? titleIndex + 1 : 0;

      if (dropIndex < minIndex) return;

      const updatedColumns = [...columnDefs];
      const [movedColumn] = updatedColumns.splice(draggedColumnIndex, 1);

      // Adjust drop index if we removed an item before it
      const adjustedDropIndex =
        draggedColumnIndex < dropIndex ? dropIndex - 1 : dropIndex;
      updatedColumns.splice(adjustedDropIndex, 0, movedColumn);

      setColumnDefs(updatedColumns);
      setDraggedColumnIndex(null);

      if (gridApi) {
        gridApi.setGridOption("columnDefs", updatedColumns);
      }
    },
    [columnDefs, draggedColumnIndex, gridApi, setColumnDefs]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedColumnIndex(null);
    setDragOverIndex(null);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showColumnMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const target = event.target as any;
      if (
        target &&
        !target.closest("[data-column-menu]") &&
        !target.closest("button")
      ) {
        setShowColumnMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnMenu]);

  return (
    <div
      data-column-menu
      style={{
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        padding: "1rem",
      }}
    >
      <button
        onClick={() => setShowColumnMenu(!showColumnMenu)}
        style={{
          padding: "8px 16px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Manage Columns
      </button>
      {showColumnMenu && (
        <div
          data-column-menu
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "12px",
            minWidth: "300px",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px" }}>Column Settings</h3>
            <button
              onClick={() => setShowColumnMenu(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {columnDefs.map((col, index) => {
              const isVisible = !col.hide;
              const isTitle = col.field === "title";
              const isPinned = !!col.pinned;
              const isDragging = draggedColumnIndex === index;
              const isDragOver = dragOverIndex === index;
              const isDraggable = !isTitle && !isPinned;

              return (
                <div
                  key={col.field}
                  draggable={isDraggable}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px",
                    backgroundColor: isTitle
                      ? "#f5f5f5"
                      : isDragOver
                      ? "#e3f2fd"
                      : isDragging
                      ? "#f0f0f0"
                      : "transparent",
                    cursor: isDraggable ? "grab" : "default",
                    opacity: isDragging ? 0.5 : 1,
                    border: isDragOver
                      ? "2px dashed #2196f3"
                      : "2px solid transparent",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                  }}
                >
                  {isDraggable && (
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#999",
                        cursor: "grab",
                      }}
                      title="Drag to reorder"
                    >
                      ⋮⋮
                    </span>
                  )}
                  {!isDraggable && <span style={{ width: "20px" }} />}
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleColumnVisibility(col.field || "")}
                    disabled={isTitle} // Don't allow hiding title
                    style={{ cursor: isTitle ? "not-allowed" : "pointer" }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      color: isTitle ? "#999" : "#333",
                      fontStyle: isTitle ? "italic" : "normal",
                    }}
                  >
                    {col.headerName || col.field}
                    {isPinned && " (Pinned)"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
