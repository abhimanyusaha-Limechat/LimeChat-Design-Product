import React from "react";
import { Box } from "@mantine/core";
import type { ComboboxItem as SelectItem } from "@mantine/core";
import { IconCircleDashedPlus, IconCircleX } from "@tabler/icons-react";
import ActionIcon from "@/components/core/ActionIcon";
import Badge from "@/components/core/Badge";
import Group from "@/components/core/Group";
import { Select } from "@/components/core/dropdowns/Select";
import TextInput from "@/components/core/inputs/TextInput";

const INPUT_MODES = {
  FREE: "text",
  SELECT: "select",
} as const;

const INPUT_TYPES = {
  TEXT: "text",
  NUMBER: "number",
} as const;

export type KeywordInputProps = {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  options?: SelectItem[];
  inputType?: (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];
  inputMode?: (typeof INPUT_MODES)[keyof typeof INPUT_MODES];
  placeholder?: string;
  error?: string | boolean;
  required?: boolean;
  onBlur?: () => void;
  maxLength?: number;
};

function KeywordInput({
  label,
  values = [],
  onChange,
  inputType = INPUT_TYPES.TEXT,
  className = "",
  options = [],
  inputMode = INPUT_MODES.FREE,
  placeholder,
  error = "",
  onBlur = () => {},
  required = false,
  maxLength,
}: KeywordInputProps) {
  const [newKeyword, setNewKeyword] = React.useState<string>("");

  const handleAddKeyword = (): void => {
    if (!newKeyword) return;
    if (maxLength !== undefined && newKeyword.length > maxLength) return;

    onChange([...values, newKeyword]);
    setNewKeyword("");
  };

  const handleDeleteKeyword = (index: number): void => {
    const newValues = [...values.slice(0, index), ...values.slice(index + 1)];
    onChange(newValues);
  };

  const handleEnterButtonPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && event.target === document.activeElement && newKeyword) {
      event.preventDefault();
      handleAddKeyword();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewKeyword(event.currentTarget.value);
  };

  const handleSelectorChange = (value: string | null): void => {
    if (value === null) return;
    onChange([...values, value]);
  };

  const removeButton = (index: number): React.ReactNode => (
    <ActionIcon
      size="xs"
      color="gray"
      radius="xl"
      variant="transparent"
      onClick={() => handleDeleteKeyword(index)}
    >
      <IconCircleX size={16} />
    </ActionIcon>
  );

  return (
    <Box className={className}>
      {inputMode === INPUT_MODES.FREE ? (
        <TextInput
          {...(label !== undefined ? { label } : {})}
          value={newKeyword}
          type={inputType}
          radius={4}
          error={error}
          placeholder={placeholder ?? "Input keyword"}
          required={required}
          {...(maxLength !== undefined && { maxLength })}
          onChange={handleInputChange}
          onKeyDown={handleEnterButtonPress}
          rightSection={
            <ActionIcon variant="transparent" onClick={handleAddKeyword}>
              <IconCircleDashedPlus size={20} color="var(--mantine-color-gray-5)" />
            </ActionIcon>
          }
          onBlur={onBlur}
        />
      ) : (
        <Select
          {...(label !== undefined ? { label } : {})}
          data={options.filter((option) => !values.includes(option.value))}
          error={error}
          searchable
          filter={({ options: opts, search }) =>
            (opts as SelectItem[]).filter(
              (item) => item.label?.toLowerCase().includes(search.toLowerCase()) ?? false,
            )
          }
          required={required}
          onChange={(val) => {
            if (val !== null) handleSelectorChange(val);
          }}
          placeholder={placeholder ?? "Select an option"}
        />
      )}

      <Box style={{ marginTop: values.length > 0 ? 8 : 0 }}>
        <Group gap="xs">
          {values.map((keyword, index) => (
            <Badge
              key={`${keyword}-${index}`}
              shape="chip"
              size="md"
              variant="light"
              rightSection={removeButton(index)}
            >
              {keyword}
            </Badge>
          ))}
        </Group>
      </Box>
    </Box>
  );
}

KeywordInput.displayname = "KeywordInput";

export default KeywordInput;
export { KeywordInput };
