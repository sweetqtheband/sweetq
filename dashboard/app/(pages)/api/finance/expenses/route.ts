import { NextRequest } from "next/server";
import { corsOptions } from "@/app/services/api/_db";
import { createExpense, getExpenses } from "@/app/services/api/_finance";
import { revalidatePath } from "next/cache";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { Expenses } from "@/app/models/expenses";

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const expenses = await getExpenses();
    return Response.json(
      {
        items: expenses,
        total: expenses.length,
        pages: 1,
      },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
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
    let body: any = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else {
      body = await req.json();
    }

    const expense = Expenses(body);
    const created = await createExpense(expense);
    revalidatePath(`/admin/finance/operations`);

    return Response.json({ data: created }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
