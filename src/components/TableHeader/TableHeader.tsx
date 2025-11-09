import { Flex, Title, Group, Button } from "@mantine/core";
import { IconPlus, IconSettings } from "@tabler/icons-react";

interface TableHeaderProps {
  onManageColumns: () => void;
  onCreateCountry: () => void;
}

export function TableHeader({ onManageColumns, onCreateCountry }: TableHeaderProps) {
  return (
    <Flex justify="space-between" align="center" mb="lg">
      <Title order={1}>Countries Data</Title>
      <Group gap="xs">
        <Button
          variant="light"
          leftSection={<IconSettings size={16} />}
          onClick={onManageColumns}
        >
          Manage Columns
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onCreateCountry}
        >
          Create Country
        </Button>
      </Group>
    </Flex>
  );
}

