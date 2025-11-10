import { useState, useCallback } from "react";
import type { ColumnDefinition } from "../types";
import { useEffect } from "react";

export function useColumns(initialColumns: ColumnDefinition[]) {
  const [columns, setColumns] = useState<ColumnDefinition[]>(initialColumns);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/columns");
        if (!res.ok) throw new Error("Failed to load columns");
        const data = await res.json();
        const list: ColumnDefinition[] = Array.isArray(data) ? data : data?.columns;
        if (!cancelled && Array.isArray(list)) setColumns(list);
      } catch {
        // keep initialColumns on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleColumnCreate = useCallback((values: ColumnDefinition) => {
    const newColumn: ColumnDefinition = {
      ...values,
      id: values.key,
    };
    // optimistic add first
    setColumns((prev) => [...prev, newColumn]);
    // persist via json-server
    (async () => {
      try {
        const res = await fetch("/api/columns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newColumn),
        });
        const created = (await res.json()) as ColumnDefinition;
        setColumns((prev) => prev.map((c) => (c.id === newColumn.id ? created : c)));
      } catch {}
    })();
    return newColumn;
  }, []);

  const handleColumnEdit = useCallback(
    (oldColumn: ColumnDefinition, values: ColumnDefinition) => {
      const oldKey = oldColumn.key;
      const newKey = values.key;

      const updated = { ...values, id: values.key } as ColumnDefinition;
      setColumns((prev) => prev.map((col) => (col.id === oldColumn.id ? updated : col)));
      (async () => {
        try {
          await fetch(`/api/columns/${oldColumn.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
        } catch {}
      })();

      return { oldKey, newKey };
    },
    []
  );

  const handleColumnDelete = useCallback((column: ColumnDefinition) => {
    if (column.key === "name") {
      return false;
    }

    setColumns((prev) => prev.filter((col) => col.id !== column.id));
    (async () => {
      try {
        await fetch(`/api/columns/${column.id}`, { method: "DELETE" });
      } catch {}
    })();
    return true;
  }, []);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((prev) => {
      const next = prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      );
      // best-effort PATCH
      const target = next.find((c) => c.id === columnId);
      if (target) {
        (async () => {
          try {
            await fetch(`/api/columns/${columnId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ visible: target.visible }),
            });
          } catch {}
        })();
      }
      return next;
    });
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

