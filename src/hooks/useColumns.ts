import { useState, useCallback } from "react";
import type { ColumnDefinition } from "../types";

export function useColumns(initialColumns: ColumnDefinition[]) {
  const [columns, setColumns] = useState<ColumnDefinition[]>(initialColumns);

  const handleColumnCreate = useCallback((values: ColumnDefinition) => {
    const newColumn: ColumnDefinition = {
      ...values,
      id: values.key,
    };
    setColumns((prev) => [...prev, newColumn]);
    return newColumn;
  }, []);

  const handleColumnEdit = useCallback(
    (oldColumn: ColumnDefinition, values: ColumnDefinition) => {
      const oldKey = oldColumn.key;
      const newKey = values.key;

      setColumns((prev) =>
        prev.map((col) =>
          col.id === oldColumn.id ? { ...values, id: values.key } : col
        )
      );

      return { oldKey, newKey };
    },
    []
  );

  const handleColumnDelete = useCallback((column: ColumnDefinition) => {
    if (column.key === "name") {
      return false;
    }

    setColumns((prev) => prev.filter((col) => col.id !== column.id));
    return true;
  }, []);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  return {
    columns,
    setColumns,
    handleColumnCreate,
    handleColumnEdit,
    handleColumnDelete,
    toggleColumnVisibility,
  };
}

