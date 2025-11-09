import {
  Modal,
  Stack,
  Group,
  Button,
  Table,
  Badge,
  Switch,
  ActionIcon,
  Title,
} from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import type { ColumnDefinition } from "../../types";

interface ColumnManagementProps {
  opened: boolean;
  onClose: () => void;
  columns: ColumnDefinition[];
  onToggleVisibility: (columnId: string) => void;
  onEdit: (column: ColumnDefinition) => void;
  onDelete: (column: ColumnDefinition) => void;
  onAdd: () => void;
}

export function ColumnManagement({
  opened,
  onClose,
  columns,
  onToggleVisibility,
  onEdit,
  onDelete,
  onAdd,
}: ColumnManagementProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Manage Columns" size="xl">
      <Stack gap="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Columns</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
            Add Column
          </Button>
        </Group>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Visible</Table.Th>
              <Table.Th>Label</Table.Th>
              <Table.Th>Key</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Optimal Value</Table.Th>
              <Table.Th>Required</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {columns.map((column) => (
              <Table.Tr key={column.id}>
                <Table.Td>
                  <Switch
                    checked={column.visible}
                    onChange={() => onToggleVisibility(column.id)}
                  />
                </Table.Td>
                <Table.Td>{column.label}</Table.Td>
                <Table.Td>
                  <Badge variant="light">{column.key}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={column.type === "number" ? "blue" : "green"}>
                    {column.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {column.optimalValue ? (
                    <Badge
                      color={
                        column.optimalValue === "lowest" ? "orange" : "teal"
                      }
                    >
                      {column.optimalValue === "lowest" ? "Lowest" : "Highest"}
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light">
                      None
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  {column.required ? (
                    <Badge color="red">Required</Badge>
                  ) : (
                    <Badge color="gray">Optional</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => onEdit(column)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => onDelete(column)}
                      disabled={column.key === "name"}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Modal>
  );
}
