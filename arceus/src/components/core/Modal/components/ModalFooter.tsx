import Group from "@/components/core/Group";

import type { ModalFooterProps } from "@/components/core/Modal/types";

function ModalFooter({ children, ...rest }: ModalFooterProps) {
  return (
    <Group justify="flex-end" mt="md" gap="sm" {...rest}>
      {children}
    </Group>
  );
}

ModalFooter.displayName = "Modal.Footer";

export default ModalFooter;
