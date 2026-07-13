export interface HubTown {
  label: string;
  href: string | null;
}

export interface HubGroup {
  id: string;
  title: string;
  description: string;
  towns: HubTown[];
}

export const locationHubGroups: HubGroup[] = [
  {
    id: "east-kent",
    title: "East Kent",
    description:
      "From our Whitstable base along the north Kent coast and inland to Canterbury, Ashford and the east Kent towns.",
    towns: [
      { label: "Whitstable", href: "/rendering-whitstable" },
      { label: "Herne Bay", href: "/rendering-herne-bay" },
      { label: "Canterbury", href: "/rendering-canterbury" },
      { label: "Faversham", href: "/rendering-faversham" },
      { label: "Sittingbourne", href: "/rendering-sittingbourne" },
      { label: "Ashford", href: "/rendering-ashford" },
      { label: "Folkestone", href: "/rendering-folkestone" },
      { label: "Dover", href: "/rendering-dover" },
      { label: "Deal", href: "/rendering-deal" },
      { label: "Sandwich", href: "/rendering-sandwich" },
      { label: "Margate", href: "/rendering-margate" },
      { label: "Ramsgate", href: "/rendering-ramsgate" },
      { label: "Broadstairs", href: "/rendering-broadstairs" },
    ],
  },
  {
    id: "mid-west",
    title: "Mid and West Kent",
    description:
      "County towns and commuter areas across mid and west Kent, covered regularly from our Whitstable base.",
    towns: [
      { label: "Maidstone", href: "/rendering-maidstone" },
      { label: "Medway", href: "/rendering-medway" },
      { label: "Tonbridge", href: "/rendering-tonbridge" },
      { label: "Tunbridge Wells", href: "/rendering-tunbridge-wells" },
    ],
  },
  {
    id: "border",
    title: "South East London and Kent Border",
    description:
      "Suburban towns and boroughs along the Kent and south east London border where we carry out rendering work.",
    towns: [
      { label: "Bromley", href: "/rendering-bromley" },
      { label: "Sidcup", href: "/rendering-sidcup" },
      { label: "Chislehurst", href: "/rendering-chislehurst" },
      { label: "Orpington", href: "/rendering-orpington" },
      { label: "Bexley", href: "/rendering-bexley" },
      { label: "Bexleyheath", href: "/rendering-bexleyheath" },
      { label: "Erith", href: "/rendering-erith" },
      { label: "Eltham", href: "/rendering-eltham" },
      { label: "Swanley", href: "/rendering-swanley" },
    ],
  },
];

export const locationHrefByLabel = Object.fromEntries(
  locationHubGroups
    .flatMap((g) => g.towns)
    .filter((t) => t.href)
    .map((t) => [t.label, t.href as string])
);

export const footerAreaLinks: HubTown[] = [
  { label: "Whitstable", href: "/rendering-whitstable" },
  { label: "Herne Bay", href: "/rendering-herne-bay" },
  { label: "Canterbury", href: "/rendering-canterbury" },
  { label: "Faversham", href: "/rendering-faversham" },
  { label: "Sittingbourne", href: "/rendering-sittingbourne" },
  { label: "Ashford", href: "/rendering-ashford" },
  { label: "Folkestone", href: "/rendering-folkestone" },
];
