import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import { getIncomeDistribution } from "@/app/services/api/_finance";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";

/**
 * GET: Obtener distribución de un ingreso
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const distribution = await getIncomeDistribution(params.id);

    if (!distribution) {
      return Response.json(
        { err: "Distribución no encontrada" },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }

    return Response.json({ data: distribution }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
