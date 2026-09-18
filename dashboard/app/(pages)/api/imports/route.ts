import { NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import { v4 as uuidv4 } from "uuid";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { formDataToObject } from "@/app/utils";
import { FactorySvc } from "@/app/services/api/factory";
import { processInstagramImport, startInstagramImport } from "@/app/services/api/imports";

const followersCol = await getCollection("followers");
const followingsCol = await getCollection("followings");
const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
const followersSvc = FactorySvc("followers", followersCol);
const followingsSvc = FactorySvc("followings", followingsCol);

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

  const importId = uuidv4();

  startInstagramImport(importId, data);
  processInstagramImport(importId, data);


  return Response.json({ importId }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
}
