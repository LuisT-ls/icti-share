import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Bem-vindo, {session.user.name || session.user.email}! Esta página é
          restrita apenas para administradores.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Role atual: {session.user.role}
        </p>
      </div>
    </div>
  );
}

