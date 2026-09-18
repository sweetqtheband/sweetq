import { NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import { v4 as uuidv4 } from "uuid";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { formDataToObject } from "@/app/utils";
import { processInstagramSync, startInstagramSync } from "@/app/services/api/imports";


export async function OPTIONS(req: NextRequest) {
    const [message, params] = corsOptions(req);
    return new Response(message, params);
}

export async function POST(req: NextRequest) {
    const [message, corsParams] = corsOptions(req);

    if (message?.error === ERRORS.CORS) {
        return new Response(message, corsParams);
    }

    const formData = await req.formData();
    const data = formDataToObject(formData, {});

    const syncId = uuidv4();

    startInstagramSync(syncId, data);
    processInstagramSync(syncId, data);


    return Response.json({ syncId }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
}
