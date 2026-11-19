import { useCallback } from "react";
import { useModals as useMantineModals } from "@mantine/modals";

import buildConfirmModalProps from "@/components/core/Modal/hooks/confirmModalProps";
import type {
  ConfirmationModalOptions,
  OpenConfirmationModal,
} from "@/components/core/Modal/types";

function useConfirmationModal(): OpenConfirmationModal {
  const modals = useMantineModals();

  return useCallback(
    (options: ConfirmationModalOptions) => {
      const props = buildConfirmModalProps(options);

      if (options.awaitConfirm !== true) {
        return modals.openConfirmModal(props);
      }

      let modalId = "";
      const modalProps = {
        ...props,
        closeOnConfirm: false,
        onConfirm: async () => {
          modals.updateModal({
            modalId,
            confirmProps: { ...props.confirmProps, loading: true },
            cancelProps: { ...props.cancelProps, disabled: true },
          });
          await Promise.resolve(options.onConfirm?.action?.()).catch(() => undefined);
          modals.closeModal(modalId);
        },
      };

      modalId = modals.openConfirmModal(modalProps);
      return modalId;
    },
    [modals],
  );
}

export default useConfirmationModal;
