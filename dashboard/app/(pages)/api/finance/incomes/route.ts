import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import { createIncome, getIncomes, calculateIncomeDistribution } from "@/app/services/api/_finance";
import { revalidatePath } from "next/cache";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { Incomes } from "@/app/models/incomes";

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const incomes = await getIncomes();
    return Response.json({ data: incomes }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const body = await req.json();
    const income = Incomes(body);
    const created = await createIncome(income);

    // Calcular distribución automáticamente
    await calculateIncomeDistribution(String(created._id), created);

    revalidatePath(`/admin/finance/operations`);

    return Response.json({ data: created }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
