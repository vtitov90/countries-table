import { Table, Flex, ActionIcon, Group, Title } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";
import { Tooltip } from "@mantine/core";
import type {
  Country,
  ColumnDefinition,
  SortColumn,
  SortDirection,
} from "../../types";
import {
  getCellValue,
  getSortIcon,
  getTopThreeValues,
} from "../../utils/tableUtils";

interface CountryTableProps {
  countries: Country[];
  visibleColumns: ColumnDefinition[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (columnKey: string) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export function CountryTable({
  countries,
  visibleColumns,
  sortColumn,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: CountryTableProps) {
  const topThreeByColumn = useMemo(() => {
    const map = new Map<string, Set<number>>();
    visibleColumns.forEach((column) => {
      if (column.optimalValue && column.type === "number" && column.required) {
        const topThree = getTopThreeValues(countries, column);
        map.set(column.key, topThree);
      }
    });
    return map;
  }, [countries, visibleColumns]);


  const isTopThreeValue = (
    country: Country,
    column: ColumnDefinition
  ): boolean => {
    if (!column.optimalValue || column.type !== "number" || !column.required) {
      return false;
    }

    const topThree = topThreeByColumn.get(column.key);
    if (!topThree || topThree.size === 0) {
      return false;
    }

    const value = country[column.key];
    if (value === null || value === undefined) {
      return false;
    }

    const numValue =
      typeof value === "number" ? value : parseFloat(value as string);
    if (isNaN(numValue)) {
      return false;
    }

    for (const topValue of topThree) {
      if (Math.abs(numValue - topValue) < 0.0001) {
        return true;
      }
    }

    return false;
  };


  return (
    <>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            {visibleColumns.map((column) => (
              <Table.Th
                key={column.id}
                style={{
                  cursor: column.sortable ? "pointer" : "default",
                  userSelect: "none",
                }}
                onClick={() => column.sortable && onSort(column.key)}
              >
                <Group gap="xs">
                  {column.label}
                  {column.optimalValue && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#868e96",
                      }}
                      title={
                        column.optimalValue === "lowest"
                          ? "Lower is better"
                          : "Higher is better"
                      }
                    >
                      {column.optimalValue === "lowest" ? "↓" : "↑"}
                    </span>
                  )}
                  {column.sortable && (
                    <span>
                      {getSortIcon(column.key, sortColumn, sortDirection)}
                    </span>
                  )}
                </Group>
              </Table.Th>
            ))}
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {countries.map((country) => (
            <Table.Tr key={country.name}>
              {visibleColumns.map((column) => (
                <Table.Td
                  key={column.id}
                  style={
                    isTopThreeValue(country, column)
                      ? { backgroundColor: "#d3f9d8" }
                      : undefined
                  }
                >
                  {getCellValue(country, column)}
                </Table.Td>
              ))}
              <Table.Td>
                <Flex gap="xs">
                  <ActionIcon
                    color="blue"
                    variant="light"
                    onClick={() => onEdit(country)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => onDelete(country)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {useMemo(() => {
        const data = countries.map((country) => {
          const contributing: string[] = [];
          visibleColumns.forEach((column) => {
            if (isTopThreeValue(country, column)) {
              contributing.push(column.label);
            }
          });
          return {
            name: country.name as string,
            points: contributing.length,
            contributing,
          };
        });

        data.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return a.name.localeCompare(b.name);
        });

        const uniquePointsDesc = Array.from(
          new Set(data.map((d) => d.points))
        ).sort((a, b) => b - a);
        const getRankColor = (points: number): string | undefined => {
          const rankIndex = uniquePointsDesc.indexOf(points);
          if (rankIndex === 0) return "#fff3bf"; // 1st
          if (rankIndex === 1) return "#d3f9d8"; // 2nd
          if (rankIndex === 2) return "#e7f5ff"; // 3rd
          return undefined;
        };

        return (
          <>
            <Title order={4} mt="md">
              Rating
            </Title>
            <Table withTableBorder withColumnBorders mt="sm" stickyHeader={false}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Country rating</Table.Th>
                  <Table.Th style={{ width: 80 }}>Points</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((row) => (
                  <Table.Tr key={row.name} style={{ backgroundColor: getRankColor(row.points) }}>
                    <Table.Td>
                      <Tooltip
                        label={
                          row.contributing.length
                            ? row.contributing.join(", ")
                            : "No contributing indices"
                        }
                        withArrow
                        multiline
                      >
                        <span>{row.name}</span>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{row.points}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        );
      }, [countries, visibleColumns, topThreeByColumn])}
    </>
  );
}
