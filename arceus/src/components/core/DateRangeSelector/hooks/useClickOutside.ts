import { useEffect } from "react";
import type { RefObject } from "react";

interface UseClickOutsideProps {
  isOpen: boolean;
  datePickerRef: RefObject<HTMLDivElement>;
  onClose: () => void;
}

export default function useClickOutside({ isOpen, datePickerRef, onClose }: UseClickOutsideProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideDatePicker = datePickerRef.current
        ? !datePickerRef.current.contains(target)
        : false;

      if (isOpen === true && isOutsideDatePicker) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen === true) {
        onClose();
      }
    };

    if (isOpen === true) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscKey);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscKey);
      };
    }

    return undefined;
  }, [isOpen, datePickerRef, onClose]);
}
