import Link from "next/link";

import { registerAction } from "@/app/auth-actions";
import { AuthForm } from "@/components/forms/auth-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 sm:gap-10 py-8 sm:py-10 px-3 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4 sm:space-y-5">
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Enlistamiento</p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-red-400">Únete a la Red Táctica</h1>
        <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase">Crea un perfil operativo y despliégate con las mejores escuadras del servidor</p>
      </div>
      <div className="space-y-4">
        <AuthForm
          title="Crear Operativo"
          description="Registro con validación de seguridad y perfil seed automático"
          action={registerAction}
          submitLabel="Registrarse"
          fields={[
            { name: "nick", label: "Apodo Operativo", type: "text", placeholder: "Tu callsign" },
            { name: "email", label: "Email de Contacto", type: "email", placeholder: "operativo@squadlink.gg" },
            { name: "password", label: "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres" },
          ]}
        />
        <p className="text-xs sm:text-sm text-red-400/70 font-mono uppercase">
          ¿Ya registrado?{" "}
          <Link href="/login" className="text-red-400 hover:text-red-300 font-black">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
