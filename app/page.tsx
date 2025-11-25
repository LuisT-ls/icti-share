import { getServerSession } from "@/lib/session";
import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ICTI Share
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold text-center mb-4">
            ICTI Share
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Bem-vindo à plataforma de compartilhamento
          </p>

          {session ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-lg text-gray-700">
                Olá, {session.user.name || session.user.email}!
              </p>
              <p className="text-sm text-gray-500">
                Role: {session.user.role}
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link
                  href="/upload"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Upload
                </Link>
                <Link
                  href="/meus-materiais"
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Meus Materiais
                </Link>
                <Link
                  href="/perfil"
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Perfil
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Faça login para acessar todas as funcionalidades
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

