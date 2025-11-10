import { useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  Country,
  ColumnDefinition,
  SortColumn,
  SortDirection,
} from "../types";
import { getInitialCountryValues, sortCountries } from "../utils/tableUtils";

export function useCountries(columns: ColumnDefinition[]) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/countries");
        if (!res.ok) throw new Error("Failed to load countries");
        const data = await res.json();
        const list: Country[] = Array.isArray(data) ? data : data?.countries;
        const normalized = (list || []).map((c: any) => ({
          ...c,
          id: c.id != null ? String(c.id) : undefined,
        })) as Country[];
        if (!cancelled) setCountries(normalized);
      } catch {
        // fallback to empty list if API not available
        if (!cancelled) setCountries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  const sortedCountries = useMemo(
    () => sortCountries(countries, sortColumn, sortDirection, columns),
    [countries, sortColumn, sortDirection, columns]
  );

  const persistPatchMany = useCallback(async (next: Country[]) => {
    // Update each country individually to keep db.json in sync when structure changes
    await Promise.all(
      next.map(async (c) => {
        if (!c.id) return;
        try {
          await fetch(`/api/countries/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(c),
          });
        } catch {}
      })
    );
  }, []);

  const handleSort = useCallback(
    (columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column?.sortable) return;

      if (sortColumn === columnKey) {
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else {
          setSortColumn(null);
          setSortDirection(null);
        }
      } else {
        setSortColumn(columnKey);
        const optimalDirection =
          column.optimalValue === "lowest" ? "asc" : "desc";
        setSortDirection(optimalDirection || "asc");
      }
    },
    [columns, sortColumn, sortDirection]
  );

  const handleCreate = useCallback(
    async (values: Country) => {
      // fill missing fields
      const payload: Country = { ...values, id: uuidv4() };
      columns.forEach((col) => {
        if (!(col.key in payload)) {
          payload[col.key] =
            col.type === "number" ? (col.required ? 0 : null) : "";
        }
      });
      try {
        const res = await fetch("/api/countries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = (await res.json()) as any;
        const normalized: Country = { ...created, id: created.id != null ? String(created.id) : payload.id };
        setCountries((prev) => [...prev, normalized]);
      } catch {
        // optimistic fallback
        setCountries((prev) => [...prev, payload]);
      }
    },
    [columns]
  );

  const handleEdit = useCallback(
    async (oldCountry: Country, values: Country) => {
      const id = (oldCountry.id ?? countries.find((c) => c.name === oldCountry.name)?.id) as string | undefined;
      const updated: Country = { ...values };
      columns.forEach((col) => {
        if (!(col.key in updated)) {
          updated[col.key] =
            col.type === "number" ? (col.required ? 0 : null) : "";
        }
      });
      if (id) {
        try {
          const res = await fetch(`/api/countries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...updated, id }),
          });
          const saved = (await res.json()) as any;
          const normalized: Country = { ...saved, id: saved.id != null ? String(saved.id) : id };
          setCountries((prev) => prev.map((c) => (c.id === id ? normalized : c)));
          return;
        } catch {}
      }
      // fallback optimistic
      setCountries((prev) => prev.map((c) => (c.name === oldCountry.name ? updated : c)));
    },
    [columns, countries]
  );

  const handleDelete = useCallback(async (country: Country) => {
    const id = (country.id ?? countries.find((c) => c.name === country.name)?.id) as string | undefined;
    if (id) {
      try {
        await fetch(`/api/countries/${id}`, { method: "DELETE" });
      } catch {}
    }
    setCountries((prev) => prev.filter((c) => (id ? c.id !== id : c.name !== country.name)));
  }, [countries]);

  const updateCountries = useCallback(
    (updater: (countries: Country[]) => Country[]) => {
      setCountries((prev) => {
        const next = updater(prev);
        // best-effort persist
        persistPatchMany(next);
        return next;
      });
    },
    [persistPatchMany]
  );

  const getInitialValues = useCallback(
    () => getInitialCountryValues(columns),
    [columns]
  );

  return {
    countries: sortedCountries,
    visibleColumns,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreate,
    handleEdit,
    handleDelete,
    updateCountries,
    getInitialValues,
  };
}
