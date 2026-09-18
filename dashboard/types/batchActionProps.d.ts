import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface batchActionProps {
    selectedRows?: string[];
    setItems?: Function;
    setIds?: Function;
    setOpen?: Function;
    setIsLoading?: Function;
    setIsWaiting?: Function;
    translations?: Record<string, any>;
    router?: AppRouterInstance;
    Toast?: Record<string, any>;
}