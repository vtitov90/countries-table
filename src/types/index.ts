export interface Country {
  id?: string;
  [key: string]: string | number | null | undefined;
  name: string;
}

export interface ColumnDefinition {
  id: string;
  key: string;
  label: string;
  type: "string" | "number";
  visible: boolean;
  sortable: boolean;
  required: boolean;
  decimalScale?: number;
  optimalValue?: "lowest" | "highest";
}

export type SortColumn = string | null;
export type SortDirection = "asc" | "desc" | null;
