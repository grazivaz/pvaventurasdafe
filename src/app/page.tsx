"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ChevronRightIcon } from "@/components/icons";
import { usePerson } from "@/hooks/useClientState";
import { savePerson } from "@/lib/client-storage";
import { PEOPLE_LIST, type PersonId } from "@/lib/people";
import { unlockAudio } from "@/lib/sound";

export default function EscolherPessoaPage() {
  const router = useRouter();
  const { person, hidratado } = usePerson();

  useEffect(() => {
    // Quem já escolheu antes vai direto para a agenda.
    if (person) router.replace("/agenda");
  }, [person, router]);

  function escolher(person: PersonId) {
    savePerson(person);
    // O primeiro toque na tela é o que libera o som no navegador.
    unlockAudio();
    router.push("/agenda");
  }

  if (!hidratado || person) {
    return <main className="min-h-svh" aria-hidden />;
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center gap-10 px-6 py-16">
      <header className="animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Agenda compartilhada
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
          Quem é você?
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Toque no seu nome. Tudo que você anotar fica marcado com ele — e a outra recebe um aviso
          na hora.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {PEOPLE_LIST.map((person, indice) => (
          <button
            key={person.id}
            type="button"
            onClick={() => escolher(person.id)}
            className="group animate-rise relative flex h-48 flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 text-left text-white shadow-[var(--shadow-float)] transition-transform duration-200 active:scale-[0.97]"
            style={{
              backgroundImage: person.gradient,
              animationDelay: `${80 + indice * 90}ms`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 font-display text-[11rem] font-semibold leading-none text-white/15"
            >
              {person.initial}
            </span>

            <span className="relative flex size-12 items-center justify-center rounded-full bg-white/25 font-display text-xl font-semibold backdrop-blur-sm">
              {person.initial}
            </span>

            <span className="relative">
              <span className="block font-display text-3xl font-semibold">{person.name}</span>
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-white/85">
                sou eu
                <ChevronRightIcon className="size-4 transition-transform group-active:translate-x-0.5" />
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted">
        Sem login e sem senha. Dá para trocar de nome depois, é só tocar no seu avatar.
      </p>
    </main>
  );
}
