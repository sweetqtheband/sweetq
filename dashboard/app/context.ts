import { createContext } from "react";

export const WindowContext = createContext({ open: false, resizing: false });

export const FilterContext = createContext({ open: false, field: "" });
