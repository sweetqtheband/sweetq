// app/old-route/page.tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/dashboard"); // se ejecuta en el server antes de renderizar
}