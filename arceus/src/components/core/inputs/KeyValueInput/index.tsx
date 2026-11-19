import React from "react";
import { Box, Grid } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import ActionIcon from "@/components/core/ActionIcon";
import Button from "@/components/core/Button";
import Group from "@/components/core/Group";
import Label from "@/components/core/Label";
import Text from "@/components/core/Text";
import TextInput from "@/components/core/inputs/TextInput";
import Stack from "@/components/core/Stack";

let _entryIdCounter = 0;
const nextEntryId = () => {
  _entryIdCounter += 1;
  return _entryIdCounter;
};

const createDictionaryEntries = (dict: { [s: string]: unknown } | ArrayLike<unknown>) =>
  Object.entries(dict).map(([key, value]) => ({ key, value, _id: nextEntryId() }));

export type InputComponentProps = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value?: string | number;
  error?: string | boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
};

const TextInputWrapper: React.FC<InputComponentProps> = ({
  label,
  placeholder,
  required,
  value,
  error,
  onChange,
}) => (
  <TextInput
    {...(label !== undefined && { label })}
    {...(placeholder !== undefined && { placeholder })}
    {...(required !== undefined && { required })}
    {...(value !== undefined && { value })}
    {...(error !== undefined && { error })}
    {...(onChange !== undefined && { onChange })}
  />
);

export type KeyValueInputProps = {
  initialDict?: { [s: string]: unknown } | ArrayLike<unknown>;
  addButtonLabel?: string;
  onChange?: (dict: { [s: string]: unknown }) => void;
  keyTitle?: string;
  valueTitle?: string;
  noItemsText?: string;
  KeyComponent?: React.ComponentType<InputComponentProps>;
  ValueComponent?: React.ComponentType<InputComponentProps>;
};

function KeyValueInput({
  initialDict = {},
  onChange = () => {},
  addButtonLabel = "Add",
  keyTitle = "Key",
  valueTitle = "Value",
  noItemsText = "No items",
  KeyComponent = TextInputWrapper,
  ValueComponent = TextInputWrapper,
}: KeyValueInputProps) {
  const [dictionary, setDictionary] = React.useState(() => createDictionaryEntries(initialDict));

  const onAdd = React.useCallback(() => {
    const entryId = nextEntryId();
    setDictionary((items) => [...items, { key: "", value: "", _id: entryId }]);
  }, []);

  const onRemove = React.useCallback((index: number) => {
    setDictionary((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  React.useEffect(() => {
    const dict = Object.fromEntries(dictionary.map((item) => [item.key, item.value]));
    onChange(dict);
  }, [dictionary]);

  const textProps = (index: number) => {
    const item = dictionary[index];
    return { value: item?.key as string | number };
  };

  return (
    <Box>
      {dictionary.length > 0 ? (
        <Box>
          <Grid gutter="zero">
            <Grid.Col span={5} pr="xs">
              <Label mb={0}>{keyTitle}</Label>
            </Grid.Col>
            <Grid.Col span={6} pr="xs">
              <Label mb={0}>{valueTitle}</Label>
            </Grid.Col>
            <Grid.Col span={1} />
          </Grid>
          <Stack gap="sm" mt="xs">
            {dictionary.map((item, index) => (
              <Grid key={item._id} gutter="zero">
                <Grid.Col span={5} pr="xs">
                  <KeyComponent
                    placeholder="Key"
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                      const value = typeof e === "string" ? e : e.currentTarget.value;
                      setDictionary((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, key: value } : entry,
                        ),
                      );
                    }}
                    {...textProps(index)}
                  />
                </Grid.Col>
                <Grid.Col span={6} pr="xs">
                  <ValueComponent
                    placeholder="Value"
                    required
                    value={item.value as string | number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                      const value = typeof e === "string" ? e : e.currentTarget.value;
                      setDictionary((items) =>
                        items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, value } : entry,
                        ),
                      );
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={1}>
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    size="lg"
                    onClick={() => onRemove(index)}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Grid.Col>
              </Grid>
            ))}
          </Stack>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              leftSection={<IconPlus size={20} />}
              onClick={() => onAdd()}
              mt="xs"
            >
              {addButtonLabel}
            </Button>
          </Group>
        </Box>
      ) : (
        <Group justify="space-between" align="center" mb="xs">
          <Text variant="body-3" italic c="light" ml="2xs">
            {noItemsText}
          </Text>
          <ActionIcon variant="light" size="md" onClick={onAdd}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      )}
    </Box>
  );
}

KeyValueInput.displayName = "KeyValueInput";

export default KeyValueInput;
export { KeyValueInput };
