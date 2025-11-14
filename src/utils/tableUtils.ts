import type {
  Country,
  ColumnDefinition,
  SortColumn,
  SortDirection,
} from "../types";

export const getCellValue = (
  country: Country,
  column: ColumnDefinition
): string => {
  const value = country[column.key];
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (column.type === "number" && column.decimalScale !== undefined) {
    return typeof value === "number"
      ? value.toFixed(column.decimalScale)
      : parseFloat(value as string).toFixed(column.decimalScale);
  }
  return String(value);
};

export const sortCountries = (
  countries: Country[],
  sortColumn: SortColumn,
  sortDirection: SortDirection,
  columns: ColumnDefinition[]
): Country[] => {
  if (!sortColumn || !sortDirection) {
    return countries;
  }

  const column = columns.find((col) => col.key === sortColumn);
  const isNumericColumn = column?.type === "number";

  return [...countries].sort((a, b) => {
    const aValue: string | number | null | undefined = a[sortColumn];
    const bValue: string | number | null | undefined = b[sortColumn];

    if (aValue === null || aValue === undefined) {
      return 1;
    }
    if (bValue === null || bValue === undefined) {
      return -1;
    }

    if (isNumericColumn) {
      const aNum = typeof aValue === "string" ? parseFloat(aValue) : aValue;
      const bNum = typeof bValue === "string" ? parseFloat(bValue) : bValue;

      if (isNaN(aNum)) return 1;
      if (isNaN(bNum)) return -1;

      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
};

export const getInitialCountryValues = (
  columns: ColumnDefinition[]
): Country => {
  const values: Country = { name: "" };
  columns.forEach((col) => {
    if (col.key !== "name") {
      values[col.key] = col.type === "number" ? (col.required ? 0 : null) : "";
    }
  });
  return values;
};

export const getSortIcon = (
  columnKey: string,
  sortColumn: SortColumn,
  sortDirection: SortDirection
): string => {
  if (sortColumn !== columnKey) {
    return "⇅";
  }
  return sortDirection === "asc" ? "↑" : "↓";
};

export const getTopThreeValues = (
  countries: Country[],
  column: ColumnDefinition
): Set<number> => {
  if (!column.optimalValue || column.type !== "number") {
    return new Set<number>();
  }

  const values = countries
    .map((country) => {
      const value = country[column.key];
      if (value === null || value === undefined) {
        return null;
      }
      const numValue =
        typeof value === "number" ? value : parseFloat(value as string);
      return isNaN(numValue) ? null : { country, value: numValue };
    })
    .filter(
      (item): item is { country: Country; value: number } => item !== null
    );

  if (values.length === 0) {
    return new Set<number>();
  }

  values.sort((a, b) => {
    if (column.optimalValue === "lowest") {
      return a.value - b.value;
    } else {
      return b.value - a.value;
    }
  });

  const topThree = values.slice(0, 3);
  const topThreeValues = new Set<number>(topThree.map((item) => item.value));

  return topThreeValues;
};

export const labelToKey = (label: string): string => {
  if (!label || !label.trim()) {
    return "";
  }

  const words = label
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  const firstWord = words[0].toLowerCase();

  const otherWords = words.slice(1).map((word) => {
    if (word.length === 0) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const camelCase = firstWord + otherWords.join("");
  return camelCase.replace(/[^a-zA-Z0-9]/g, "");
};
