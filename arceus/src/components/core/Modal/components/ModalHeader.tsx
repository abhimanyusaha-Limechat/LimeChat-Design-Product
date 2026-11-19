

import Stack from "@/components/core/Stack";
import Text from "@/components/core/Text";
import Title from "@/components/core/Title";

type ModalHeaderProps = {
  title: string;
  description?: string;
};

function ModalHeader({ title, description = "" }: ModalHeaderProps) {
  return (
    <Stack gap="2xs">
      <Title variant="h4" tone="dark">
        {title}
      </Title>
      {description !== "" && (
        <Text variant="body-2" tone="light">
          {description}
        </Text>
      )}
    </Stack>
  );
}

export default ModalHeader;
