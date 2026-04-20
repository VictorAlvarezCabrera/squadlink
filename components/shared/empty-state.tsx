import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="border-2 border-dashed border-red-600/30 bg-black p-6 sm:p-8 text-center text-red-300">
      <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest text-red-400">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm font-mono uppercase">{description}</p>
      {action ? <div className="mt-4 sm:mt-5">{action}</div> : null}
    </div>
  );
}
