export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  color: string;
  description: string;
  concept: string;
  services: string[];
  role: string;
  cover: string;
  caption: string;
}
export const projects: Project[] = [
  {
    id: "nexora",
    title: "NEXORA",
    category: "Digital Brand Experience",
    year: "2026",
    color: "#a4b4ed",
    cover: "/projects/nexora.svg",
    caption: "A new perspective on connection.",
    description:
      "An imagined technology brand expressed as a living orbital system. Precision typography and sculptural chrome turn an abstract network into something tangible.",
    concept:
      "The visual system starts with one continuous loop. Across the interface, the loop expands, fractures and reconnects — a visual language for possibility.",
    services: ["Art direction", "Creative development", "3D visualisation"],
    role: "Concept, design & development",
  },
  {
    id: "velora",
    title: "VELORA",
    category: "Interactive 3D Website",
    year: "2026",
    color: "#c4ed72",
    cover: "/projects/velora.svg",
    caption: "Architecture for a new digital landscape.",
    description:
      "A concept for a spatial website where impossible architecture becomes the navigation. Quiet surfaces and acid-green structures invite a slower kind of exploration.",
    concept:
      "A modular pavilion moves between object and environment. Each perspective reveals a different path through the same structure.",
    services: ["Interaction design", "WebGL", "Creative development"],
    role: "Design & interactive development",
  },
  {
    id: "aurora",
    title: "AURORA",
    category: "Visual Identity",
    year: "2026",
    color: "#ddb4ed",
    cover: "/projects/aurora.svg",
    caption: "Identity, in a constant state of becoming.",
    description:
      "An experimental visual identity built around soft interference, spectral colour and an endlessly changing symbol.",
    concept:
      "A family of flowing contours becomes a flexible mark. The system can behave as a still image, a motion study or an interactive surface.",
    services: ["Visual identity", "Generative design", "Art direction"],
    role: "Concept & visual design",
  },
  {
    id: "flux",
    title: "FLUX",
    category: "Motion Design",
    year: "2026",
    color: "#ff8759",
    cover: "/projects/flux.svg",
    caption: "Finding rhythm in the unexpected.",
    description:
      "A study of energy and repetition. A bright ribbon cuts through a dark field, turning simple geometry into an expressive motion language.",
    concept:
      "The same continuous line creates a spectrum of compositions through controlled changes in tension, scale and rhythm.",
    services: ["Motion design", "3D animation", "Visual exploration"],
    role: "Direction & motion design",
  },
  {
    id: "obscura",
    title: "OBSCURA",
    category: "Experimental Digital Art",
    year: "2026",
    color: "#a8b3ff",
    cover: "/projects/obscura.svg",
    caption: "At the edge of the visible.",
    description:
      "A digital sculpture series exploring light as a material. Fragments emerge from darkness and gather into an unfamiliar celestial form.",
    concept:
      "Negative space does as much work as the geometry. The composition is intentionally restrained, allowing a single luminous edge to carry the image.",
    services: ["Digital art", "Procedural geometry", "Lighting"],
    role: "Artist & creative developer",
  },
  {
    id: "monolith",
    title: "MONOLITH",
    category: "Architecture & Spatial Design",
    year: "2026",
    color: "#cec3aa",
    cover: "/projects/monolith.svg",
    caption: "A conversation between space and silence.",
    description:
      "An imagined architectural installation composed of monumental forms, warm stone and precise natural light.",
    concept:
      "Three simple volumes establish a sequence of thresholds. The project explores how scale and shadow can shape a spatial narrative.",
    services: ["Spatial concept", "3D visualisation", "Art direction"],
    role: "Concept & spatial design",
  },
];
export const services = [
  {
    title: "Creative Web Development",
    note: "Thoughtful interfaces. Unexpected details.",
    detail:
      "Distinctive, responsive websites where design and engineering work as one.",
    shape: "orbit",
  },
  {
    title: "Immersive 3D Websites",
    note: "A new dimension of presence.",
    detail:
      "Real-time WebGL environments that turn browsing into an experience.",
    shape: "sphere",
  },
  {
    title: "Interactive Experiences",
    note: "Built to be explored.",
    detail:
      "Playful digital spaces that respond to movement, curiosity and touch.",
    shape: "grid",
  },
  {
    title: "Motion Design",
    note: "Every movement has a purpose.",
    detail:
      "Expressive motion systems, from precise microinteractions to cinematic sequences.",
    shape: "wave",
  },
  {
    title: "Visual Identity",
    note: "Recognisable at every scale.",
    detail:
      "Original visual languages built from typography, form and a clear idea.",
    shape: "cross",
  },
  {
    title: "Experimental Digital Art",
    note: "Somewhere beyond the expected.",
    detail:
      "Procedural forms and visual experiments at the intersection of code and art.",
    shape: "portal",
  },
];
export const contact: { label: string; href: string | null; hint: string }[] = [
  { label: "Email", href: null, hint: "Add your email address" },
  { label: "Instagram", href: null, hint: "Add your Instagram URL" },
  { label: "Telegram", href: null, hint: "Add your Telegram URL" },
  { label: "Behance", href: null, hint: "Add your Behance URL" },
  { label: "GitHub", href: null, hint: "Add your GitHub URL" },
];
export const chapters = [
  {
    title: "The awakening",
    label: "A thought becomes a world.",
    text: "An exploration of form, motion and the spaces in between.",
  },
  {
    title: "Collision of worlds",
    label: "Ideas don’t exist in isolation.",
    text: "Different disciplines. Shared gravity. New possibilities.",
  },
  {
    title: "The fracture",
    label: "Break the familiar.",
    text: "Deconstruct the expected. Find something extraordinary in the pieces.",
  },
  {
    title: "The infinite tunnel",
    label: "There is always more beyond.",
    text: "Move through a constellation of ideas, one perspective at a time.",
  },
  {
    title: "The liquid dimension",
    label: "Nothing stays the same.",
    text: "Rigid boundaries give way to fluid possibilities.",
  },
  {
    title: "The portal",
    label: "On the other side of ordinary.",
    text: "A threshold between what exists and what could be.",
  },
  {
    title: "Project constellation",
    label: "Ideas, made tangible.",
    text: "Select a world to explore. Or continue to the full collection.",
  },
];
