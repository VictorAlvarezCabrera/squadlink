import Link from "next/link";

import { loginAction } from "@/app/auth-actions";
import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 sm:gap-10 py-8 sm:py-10 px-3 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4 sm:space-y-5">
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Acceso Operacional</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-red-400">Ingresa a tu Centro de Comando</h1>
        <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase">Demo: lyra@squadlink.gg | admin@squadlink.gg | Contraseña: demo12345</p>
        <div className="border border-red-400/20 bg-red-500/5 p-4 sm:p-6 text-red-300/80 card-hover">
          <p className="text-xs sm:text-sm font-mono uppercase">Acceso restringido: Dashboard • Perfil • Compatibilidad • Ajustes • Administración</p>
        </div>
      </div>
      <div className="space-y-4">
        <AuthForm
          title="Verificación Táctica"
          description="Autenticación biométrica y credenciales de sesión"
          action={loginAction}
          submitLabel="Autorizar Acceso"
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "operativo@squadlink.gg" },
            { name: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
          ]}
        />
        <p className="text-xs sm:text-sm text-red-400/70 font-mono uppercase">
          ¿Sin credenciales?{" "}
          <Link href="/registro" className="text-red-400 hover:text-red-300 font-black">
            Crear Cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
