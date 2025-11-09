import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { ColumnDefinition } from "../../types";

interface ColumnFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ColumnDefinition) => void;
  columns: ColumnDefinition[];
  initialValues?: ColumnDefinition;
  title: string;
}

export function ColumnForm({
  opened,
  onClose,
  onSubmit,
  columns,
  initialValues,
  title,
}: ColumnFormProps) {
  const form = useForm<ColumnDefinition>({
    initialValues: initialValues || {
      id: "",
      key: "",
      label: "",
      type: "number",
      visible: true,
      sortable: true,
      required: false,
      decimalScale: 1,
      optimalValue: undefined,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.key.trim()) {
        errors.key = "Key is required";
      } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(values.key)) {
        errors.key =
          "Key must start with a letter and contain only letters and numbers";
      } else if (
        columns.some((c) => c.key === values.key && c.id !== values.id)
      ) {
        errors.key = "Key already exists";
      }
      if (!values.label.trim()) {
        errors.label = "Label is required";
      }
      return errors;
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: ColumnDefinition) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={title}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Column Key"
            placeholder="e.g., populationIndex"
            description="Must start with a letter and contain only letters and numbers"
            {...form.getInputProps("key")}
            disabled={initialValues?.key === "name"}
            required
          />
          <TextInput
            label="Column Label"
            placeholder="e.g., Population Index"
            {...form.getInputProps("label")}
            required
          />
          <Select
            label="Type"
            data={[
              { value: "string", label: "String" },
              { value: "number", label: "Number" },
            ]}
            {...form.getInputProps("type")}
            required
          />
          {form.values.type === "number" && (
            <>
              <NumberInput
                label="Decimal Scale"
                placeholder="Number of decimal places"
                {...form.getInputProps("decimalScale")}
                min={0}
                max={5}
                required
              />
              <Select
                label="Optimal Value"
                description="What value is considered best for this column"
                placeholder="Select optimal value"
                data={[
                  {
                    value: "lowest",
                    label: "Lowest is best (e.g., rent, cost)",
                  },
                  {
                    value: "highest",
                    label: "Highest is best (e.g., safety, quality)",
                  },
                ]}
                clearable
                {...form.getInputProps("optimalValue")}
              />
            </>
          )}
          <Checkbox
            label="Required"
            {...form.getInputProps("required", { type: "checkbox" })}
          />
          <Checkbox
            label="Visible"
            {...form.getInputProps("visible", { type: "checkbox" })}
          />
          <Checkbox
            label="Sortable"
            {...form.getInputProps("sortable", { type: "checkbox" })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">{initialValues ? "Save" : "Create"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
