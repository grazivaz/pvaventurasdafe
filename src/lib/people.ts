export const PERSON_IDS = ["julyana", "grazielle"] as const;

export type PersonId = (typeof PERSON_IDS)[number];

export type Person = {
  id: PersonId;
  name: string;
  initial: string;
  /** Cor base da pessoa. Vira a variável CSS `--person` nos componentes. */
  color: string;
  /** Gradiente usado nos cartões grandes da tela de escolha. */
  gradient: string;
};

export const PEOPLE: Record<PersonId, Person> = {
  julyana: {
    id: "julyana",
    name: "Julyana",
    initial: "J",
    color: "#7c5cff",
    gradient: "linear-gradient(140deg, #a08cff 0%, #7c5cff 55%, #5a34e0 100%)",
  },
  grazielle: {
    id: "grazielle",
    name: "Grazielle",
    initial: "G",
    color: "#ff4d8d",
    gradient: "linear-gradient(140deg, #ff8fb4 0%, #ff4d8d 55%, #e0246b 100%)",
  },
};

export const PEOPLE_LIST: Person[] = PERSON_IDS.map((id) => PEOPLE[id]);

export function isPersonId(value: unknown): value is PersonId {
  return typeof value === "string" && (PERSON_IDS as readonly string[]).includes(value);
}

export function getPerson(id: PersonId): Person {
  return PEOPLE[id];
}

export function otherPerson(id: PersonId): Person {
  return PEOPLE[id === "julyana" ? "grazielle" : "julyana"];
}

/** Props para pintar um bloco com as cores da pessoa (ver `.person-theme` no globals.css). */
export function personStyle(id: PersonId): React.CSSProperties {
  return { ["--person" as string]: PEOPLE[id].color };
}
