/**
 * Drag-and-drop for the composer: `dragging` is true while files are dragged over it, and `dropHandlers`
 * go on the element that should accept them. dragenter / dragleave also fire for every child the pointer
 * crosses, so a depth counter tells "left the element" from "moved onto a child".
 */
import { useRef, useState, type DragEvent } from 'react';

const hasFiles = (e: DragEvent) => e.dataTransfer.types.includes('Files');

export function useFileDrop(onFiles: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const dropHandlers = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault(); // without this the browser refuses the drop
    },
    onDragLeave: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      onFiles(Array.from(e.dataTransfer.files));
    },
  };

  return { dragging, dropHandlers };
}
