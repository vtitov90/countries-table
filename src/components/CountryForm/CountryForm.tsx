import { Modal, Stack, Group, Button, TextInput, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { Country, ColumnDefinition } from "../../types";
import { getInitialCountryValues } from "../../utils/tableUtils";

interface CountryFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Country) => void;
  columns: ColumnDefinition[];
  title: string;
  initialValues?: Country;
  submitLabel?: string;
}

export function CountryForm({
  opened,
  onClose,
  onSubmit,
  columns,
  title,
  initialValues,
  submitLabel = "Submit",
}: CountryFormProps) {
  const form = useForm<Country>({
    initialValues: initialValues || getInitialCountryValues(columns),
  });

  useEffect(() => {
    if (opened) {
      if (initialValues) {
        const formValues: Country = { ...initialValues };
        columns.forEach((col) => {
          if (!(col.key in formValues)) {
            formValues[col.key] =
              col.type === "number" ? (col.required ? 0 : null) : "";
          }
        });
        form.setValues(formValues);
      } else {
        form.setValues(getInitialCountryValues(columns));
      }
    }
  }, [opened, initialValues, columns]);

  const handleClose = () => {
    form.setValues(getInitialCountryValues(columns));
    onClose();
  };

  const handleSubmit = (values: Country) => {
    onSubmit(values);
    form.setValues(getInitialCountryValues(columns));
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {columns.map((column) => {
            if (column.type === "number") {
              return (
                <NumberInput
                  key={column.id}
                  label={column.label}
                  placeholder={`Enter ${column.label.toLowerCase()}`}
                  {...form.getInputProps(column.key)}
                  min={0}
                  decimalScale={column.decimalScale}
                  required={column.required}
                  allowNegative={false}
                />
              );
            }
            return (
              <TextInput
                key={column.id}
                label={column.label}
                placeholder={`Enter ${column.label.toLowerCase()}`}
                {...form.getInputProps(column.key)}
                required={column.required}
              />
            );
          })}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

