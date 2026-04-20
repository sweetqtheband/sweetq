"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow } from "@carbon/react";
import React from "react";

interface DraggableRowProps {
  id: string | number;
  children: React.ReactNode;
  [key: string]: any;
}

export function DraggableRow({ id, children, ...props }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
      className={isDragging ? "dragging" : props.className}
    >
      {children}
    </TableRow>
  );
}
