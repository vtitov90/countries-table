import { useState, useCallback } from "react";
import { MantineProvider, Container } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Country, ColumnDefinition } from "./types";
import { defaultColumns } from "./constants/columns";
import { useCountries } from "./hooks/useCountries";
import { useColumns } from "./hooks/useColumns";
import { TableHeader } from "./components/TableHeader/TableHeader";
import { CountryTable } from "./components/CountryTable/CountryTable";
import { CountryForm } from "./components/CountryForm/CountryForm";
import { CountryDeleteModal } from "./components/CountryDeleteModal/CountryDeleteModal";
import { ColumnManagement } from "./components/ColumnManagement/ColumnManagement";
import { ColumnForm } from "./components/ColumnForm/ColumnForm";
import { ColumnDeleteModal } from "./components/ColumnDeleteModal/ColumnDeleteModal";

function App() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [columnEditModalOpen, setColumnEditModalOpen] = useState(false);
  const [columnDeleteModalOpen, setColumnDeleteModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<ColumnDefinition | null>(
    null
  );

  const {
    columns,
    handleColumnCreate,
    handleColumnEdit,
    handleColumnDelete,
    toggleColumnVisibility,
  } = useColumns(defaultColumns);

  const {
    countries,
    visibleColumns,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreate,
    handleEdit,
    handleDelete,
    updateCountries,
  } = useCountries(columns);

  const openEditModal = useCallback((country: Country) => {
    setSelectedCountry(country);
    setEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((country: Country) => {
    setSelectedCountry(country);
    setDeleteModalOpen(true);
  }, []);

  const openColumnEditModal = useCallback((column: ColumnDefinition) => {
    setSelectedColumn(column);
    setColumnEditModalOpen(true);
  }, []);

  const openColumnDeleteModal = useCallback((column: ColumnDefinition) => {
    setSelectedColumn(column);
    setColumnDeleteModalOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(
    (values: Country) => {
      handleCreate(values);
      setCreateModalOpen(false);
    },
    [handleCreate]
  );

  const handleEditSubmit = useCallback(
    (values: Country) => {
      if (selectedCountry) {
        handleEdit(selectedCountry, values);
      }
      setEditModalOpen(false);
      setSelectedCountry(null);
    },
    [selectedCountry, handleEdit]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedCountry) {
      handleDelete(selectedCountry);
    }
    setDeleteModalOpen(false);
    setSelectedCountry(null);
  }, [selectedCountry, handleDelete]);

  const handleColumnCreateSubmit = useCallback(
    (values: ColumnDefinition) => {
      const newColumn = handleColumnCreate(values);
      updateCountries((prevCountries) =>
        prevCountries.map((country) => ({
          ...country,
          [newColumn.key]:
            newColumn.type === "number" ? (newColumn.required ? 0 : null) : "",
        }))
      );
      setColumnEditModalOpen(false);
      setSelectedColumn(null);
    },
    [handleColumnCreate, updateCountries]
  );

  const handleColumnEditSubmit = useCallback(
    (values: ColumnDefinition) => {
      if (selectedColumn) {
        const result = handleColumnEdit(selectedColumn, values);
        if (result.oldKey !== result.newKey) {
          updateCountries((prevCountries) =>
            prevCountries.map((country) => {
              const newCountry = { ...country };
              if (result.oldKey in newCountry) {
                newCountry[result.newKey] = newCountry[result.oldKey];
                delete newCountry[result.oldKey];
              }
              return newCountry;
            })
          );
        }
      }
      setColumnEditModalOpen(false);
      setSelectedColumn(null);
    },
    [selectedColumn, handleColumnEdit, updateCountries]
  );

  const handleColumnDeleteConfirm = useCallback(() => {
    if (selectedColumn) {
      const deleted = handleColumnDelete(selectedColumn);
      if (!deleted) {
        alert("Cannot delete the 'name' column as it is required.");
      } else {
        updateCountries((prevCountries) =>
          prevCountries.map((country) => {
            const newCountry = { ...country };
            delete newCountry[selectedColumn.key];
            return newCountry;
          })
        );
      }
    }
    setColumnDeleteModalOpen(false);
    setSelectedColumn(null);
  }, [selectedColumn, handleColumnDelete, updateCountries]);

  return (
    <MantineProvider>
      <Container py="xl">
        <TableHeader
          onManageColumns={() => setColumnsModalOpen(true)}
          onCreateCountry={() => setCreateModalOpen(true)}
        />

        <CountryTable
          countries={countries}
          visibleColumns={visibleColumns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />

        <CountryForm
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          columns={columns}
          title="Create Country"
          submitLabel="Create"
        />

        <CountryForm
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCountry(null);
          }}
          onSubmit={handleEditSubmit}
          columns={columns}
          title="Edit Country"
          submitLabel="Save"
          initialValues={selectedCountry || undefined}
        />

        <CountryDeleteModal
          opened={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedCountry(null);
          }}
          onConfirm={handleDeleteConfirm}
          country={selectedCountry}
        />

        <ColumnManagement
          opened={columnsModalOpen}
          onClose={() => setColumnsModalOpen(false)}
          columns={columns}
          onToggleVisibility={toggleColumnVisibility}
          onEdit={openColumnEditModal}
          onDelete={openColumnDeleteModal}
          onAdd={() => {
            setSelectedColumn(null);
            setColumnEditModalOpen(true);
          }}
        />

        <ColumnForm
          opened={columnEditModalOpen}
          onClose={() => {
            setColumnEditModalOpen(false);
            setSelectedColumn(null);
          }}
          onSubmit={
            selectedColumn ? handleColumnEditSubmit : handleColumnCreateSubmit
          }
          columns={columns}
          title={selectedColumn ? "Edit Column" : "Create Column"}
          initialValues={selectedColumn || undefined}
        />

        <ColumnDeleteModal
          opened={columnDeleteModalOpen}
          onClose={() => {
            setColumnDeleteModalOpen(false);
            setSelectedColumn(null);
          }}
          onConfirm={handleColumnDeleteConfirm}
          column={selectedColumn}
        />
      </Container>
    </MantineProvider>
  );
}

export default App;
