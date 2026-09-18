export type ImportProgress = {
    data: Record<string, any>;
    total: number;
    processed: number;
    log: string[];
    status: "running" | "completed" | "error";
    results?: Record<string, any>;
};