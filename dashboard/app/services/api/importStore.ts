import type { ImportProgress } from "@/types/import-progress";

declare global {
    var importStore: Map<string, ImportProgress>;
}

if (!global.importStore) {
    global.importStore = new Map<string, ImportProgress>();
}

export const getImportFromStore = (importId: string) => {
    return global.importStore.get(importId);
};

export const setImportInStore = (importId: string, progress: ImportProgress) => {
    global.importStore.set(importId, progress);
};