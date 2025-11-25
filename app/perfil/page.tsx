import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";

export default async function PerfilPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Meu Perfil</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <p className="mt-1 text-lg text-gray-900">
              {session.user.name || "Não informado"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-lg text-gray-900">{session.user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <p className="mt-1 text-lg text-gray-900">{session.user.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <p className="mt-1 text-sm text-gray-500">{session.user.id}</p>
          </div>
        </div>

        <form action={logout} className="mt-8">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

