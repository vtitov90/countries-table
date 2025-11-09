import { Modal, Stack, Group, Button } from "@mantine/core";
import type { Country } from "../../types";

interface CountryDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  country: Country | null;
}

export function CountryDeleteModal({
  opened,
  onClose,
  onConfirm,
  country,
}: CountryDeleteModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Country">
      <Stack gap="md">
        <p>
          Are you sure you want to delete <strong>{country?.name}</strong>? This
          action cannot be undone.
        </p>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

