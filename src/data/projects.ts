export type ProjectEntry = {
  slug: string;
  href: string;
  title: string;
  locationLabel: string;
  summary: string;
  image: string;
  imageAlt: string;
  footerLabel: string;
};

export const projectsHubPath = "/projects";

export const projects: ProjectEntry[] = [
  {
    slug: "baumit-thin-coat-render-tonbridge",
    href: "/projects/baumit-thin-coat-render-tonbridge",
    title: "Baumit Thin Coat Render",
    locationLabel: "Tonbridge, Kent",
    summary:
      "Full Baumit thin coat system on a three-storey period home, installed to manufacturer specification with a backed guarantee.",
    image: "/images/projects/baumit-thin-coat-render-tonbridge-period-house.jpg",
    imageAlt:
      "Three-storey period house in Tonbridge under scaffolding during Baumit thin coat render",
    footerLabel: "Baumit render, Tonbridge",
  },
  {
    slug: "ecorend-quartz-render-plinth",
    href: "/projects/ecorend-quartz-render-plinth",
    title: "Ecorend Quartz Render Plinth",
    locationLabel: "Kent",
    summary:
      "Dark grey Ecorend QR1 quartz render plinth with a stone effect finish, giving a durable base line below the main render.",
    image: "/images/projects/quartz-render-plinth-house-front-kent.jpg",
    imageAlt: "Rendered house with dark grey Ecorend quartz render plinth in Kent",
    footerLabel: "Quartz render plinth",
  },
  {
    slug: "baumit-silicone-render-garden-building",
    href: "/projects/baumit-silicone-render-garden-building",
    title: "Silicone Render Outbuilding",
    locationLabel: "Kent",
    summary:
      "Baumit StarContact and SilikonTop on a detached garden building, plus pebble dash patch repair to the main house.",
    image: "/images/projects/baumit-silicone-render-garden-building-kent.jpg",
    imageAlt: "Detached garden outbuilding finished in light Baumit silicone render in Kent",
    footerLabel: "Garden outbuilding render",
  },
];
