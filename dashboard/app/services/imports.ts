import axios from "axios";
import { POST } from "./_api";

const client = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URI}/imports`,
});

const onSave = async (data: Record<string, any>) => {
    const response = await POST(client, data);
    return response.data.importId;
}

const onSync = async (data: Record<string, any>) => {
    const response = await POST(client, data, 'sync');
    return response.data.syncId;
}

export const Imports = {
    onSave,
    onSync,
}