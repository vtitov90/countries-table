import { Modal, Stack, Group, Button } from "@mantine/core";
import type { ColumnDefinition } from "../../types";

interface ColumnDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  column: ColumnDefinition | null;
}

export function ColumnDeleteModal({
  opened,
  onClose,
  onConfirm,
  column,
}: ColumnDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Column">
      <Stack gap="md">
        <p>
          Are you sure you want to delete the column{" "}
          <strong>{column?.label}</strong>? This will remove the column from
          all countries. This action cannot be undone.
        </p>
        {column?.key === "name" && (
          <p style={{ color: "red" }}>
            Cannot delete the 'name' column as it is required.
          </p>
        )}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={onConfirm}
            disabled={column?.key === "name"}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

