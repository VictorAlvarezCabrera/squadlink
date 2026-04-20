export function SiteFooter() {
  return (
    <footer className="border-t border-slate-300/20 bg-slate-950/70 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-full flex-col gap-2 px-4 py-5 text-sm text-slate-200/85 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p className="transition-colors duration-200 hover:text-cyan-100">
          SquadLink. Red social gamer para descubrir jugadores compatibles, clanes, eventos y Busco grupo (LFG).
        </p>
        <p className="text-slate-300/70">MVP centrado en perfiles, comunidad, matching visible y juegos con APIs viables.</p>
      </div>
    </footer>
  );
}
