import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  Country,
  ColumnDefinition,
  SortColumn,
  SortDirection,
} from "../types";
import { getInitialCountryValues, sortCountries } from "../utils/tableUtils";
import countriesData from "../counties.json";

export function useCountries(columns: ColumnDefinition[]) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    setCountries(countriesData.countries as Country[]);
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  const sortedCountries = useMemo(
    () => sortCountries(countries, sortColumn, sortDirection, columns),
    [countries, sortColumn, sortDirection, columns]
  );

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
    (values: Country) => {
      setCountries((prev) => {
        const newCountry: Country = { ...values };
        columns.forEach((col) => {
          if (!(col.key in newCountry)) {
            newCountry[col.key] =
              col.type === "number" ? (col.required ? 0 : null) : "";
          }
        });
        return [...prev, newCountry];
      });
    },
    [columns]
  );

  const handleEdit = useCallback(
    (oldCountry: Country, values: Country) => {
      setCountries((prev) => {
        const updatedCountry: Country = { ...values };
        columns.forEach((col) => {
          if (!(col.key in updatedCountry)) {
            updatedCountry[col.key] =
              col.type === "number" ? (col.required ? 0 : null) : "";
          }
        });
        return prev.map((c) =>
          c.name === oldCountry.name ? updatedCountry : c
        );
      });
    },
    [columns]
  );

  const handleDelete = useCallback((country: Country) => {
    setCountries((prev) => prev.filter((c) => c.name !== country.name));
  }, []);

  const updateCountries = useCallback(
    (updater: (countries: Country[]) => Country[]) => {
      setCountries(updater);
    },
    []
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
