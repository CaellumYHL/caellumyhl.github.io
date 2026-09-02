import auctopusImage from '../../images/auctopus.png'
import blueprintImage from '../../images/blueprint.png'
import paperCutsImage from '../../images/papercuts.png'
import twinUniverseImage from '../../images/twinuniverse.png'

export type ExhibitId =
  | 'paper-cuts'
  | 'ensemble'
  | 'auctopus'
  | 'twin-universe'
  | 'experience'
  | 'skills'

export type ExhibitKind = 'project' | 'experience' | 'skills'

export interface PortfolioLink {
  readonly label: string
  readonly href: string
  readonly kind?: 'external' | 'email' | 'download' | 'phone'
}

export interface TimelineEntry {
  readonly role: string
  readonly organization: string
  readonly period: string
  readonly location: string
  readonly image?: string
  readonly bullets: readonly string[]
}

export interface SkillGroup {
  readonly label: string
  readonly items: readonly string[]
}

export interface Exhibit {
  readonly id: ExhibitId
  readonly index: number
  readonly kind: ExhibitKind
  readonly navLabel: string
  readonly title: string
  readonly eyebrow: string
  readonly period?: string
  readonly position: readonly [number, number, number]
  readonly rotation?: number
  readonly accent: string
  readonly summary: string
  readonly metric: string
  readonly metricLabel: string
  readonly paragraphs?: readonly string[]
  readonly bullets?: readonly string[]
  readonly tech?: readonly string[]
  readonly links?: readonly PortfolioLink[]
  readonly image?: string
  readonly imageAspect?: number
  readonly timeline?: readonly TimelineEntry[]
  readonly skillGroups?: readonly SkillGroup[]
}

export const exhibits: readonly Exhibit[] = [
  {
    id: 'paper-cuts',
    index: 1,
    kind: 'project',
    navLabel: 'Paper Cuts',
    title: 'Paper Cuts',
    eyebrow: 'Cal Hacks AI Hackathon · June 2026',
    position: [-10.6, 0, -0.8],
    rotation: Math.PI / 2,
    accent: '#a94750',
    summary:
      'A real-time game engine that turns a hand-drawn sketch into a playable asset and mechanic in less than a second.',
    metric: '1st Overall',
    metricLabel: '$5,000 prize · Best UI/UX',
    image: paperCutsImage,
    imageAspect: 16 / 9,
    bullets: [
      'Trained an SDXL diffusion model on AWS Trainium and paired it with a cascading CNN/VLM plus Redis HNSW vector memory.',
      'Built “Moose,” a LoRA-tuned model that maps drawings to safe, playable mechanics with latency under 500 ms.',
    ],
    tech: ['Python', 'PyTorch', 'FastAPI', 'Redis', 'AWS Trainium', 'JavaScript'],
    links: [
      {
        label: 'Open on Devpost',
        href: 'https://devpost.com/software/paper-cuts',
        kind: 'external',
      },
    ],
  },
  {
    id: 'ensemble',
    index: 2,
    kind: 'project',
    navLabel: 'Ensemble',
    title: 'Ensemble',
    eyebrow: 'Hack the Six · July 2026',
    position: [-6.35, 0, -9.35],
    accent: '#655184',
    summary:
      'An agentic conducting system that turns physical gestures into musical intent and keeps a room of connected devices in sync.',
    metric: 'Top 5',
    metricLabel: 'Overall at Hack the Six',
    bullets: [
      'Used a QNX Raspberry Pi and Arduino UNO R4 conducting wand to run TinyML gesture recognition and broadcast musical intent over WebSockets.',
      'Fine-tuned a real-time Qwen LoRA model on a Fireworks H200 with SFT and GRPO; it composes new bars from classical music theory at 453 ms latency.',
    ],
    tech: ['Python', 'QNX', 'Raspberry Pi', 'WebSockets', 'Qwen LoRA', 'Web Audio API'],
    links: [
      {
        label: 'Open on Devpost',
        href: 'https://devpost.com/software/ensemble-jbgqrd',
        kind: 'external',
      },
    ],
  },
  {
    id: 'auctopus',
    index: 3,
    kind: 'project',
    navLabel: 'Auctopus',
    title: 'Auctopus',
    eyebrow: 'SOON Hackathon · May 2026',
    position: [10.6, 0, -0.8],
    rotation: -Math.PI / 2,
    accent: '#bd8332',
    summary:
      'An automated AI product-validation pipeline that researches, prototypes, simulates audiences, and delivers 3D AR concepts.',
    metric: '2× 1st',
    metricLabel: 'Cloudinary and Polarity tracks',
    image: auctopusImage,
    imageAspect: 1284 / 816,
    bullets: [
      'Orchestrated Gemini 2.5 Pro, Veo 2, Neo4j, and a Next.js SSE execution chain into an end-to-end validation workflow.',
      'Automated Meshy 3D AR generation and delivery through Cloudinary’s CDN, with Composio analytics, CyStack secrets, and Polarity review.',
    ],
    tech: ['Next.js', 'Gemini 2.5 Pro', 'Veo 2', 'Neo4j', 'Cloudinary'],
    links: [
      {
        label: 'Open on Devpost',
        href: 'https://devpost.com/software/auctopus',
        kind: 'external',
      },
    ],
  },
  {
    id: 'twin-universe',
    index: 4,
    kind: 'project',
    navLabel: 'Twin Universe',
    title: 'Twin Universe',
    eyebrow: 'Owner / Software Lead · Bronze Bat Studio · 2023 — Present',
    position: [6.35, 0, -9.35],
    accent: '#a7434b',
    summary:
      'A Roblox spaceflight game featuring rocket launches, spacecraft progression, and multiplayer missions.',
    metric: '2.8M+',
    metricLabel: 'Player visits on Roblox',
    image: twinUniverseImage,
    imageAspect: 1,
    bullets: [
      'Designed and implemented interactive environments, rocket launch mechanics, and player progression in Lua.',
      'Built multiplayer mission systems and released the game through Bronze Bat Studio; it has received more than 2.8 million Roblox visits.',
    ],
    tech: ['Lua', 'Roblox Studio', 'Multiplayer Systems', 'Game Design'],
    links: [
      {
        label: 'Play on Roblox',
        href: 'https://www.roblox.com/games/4818610549/Twin-Universe-Space-Travel-RP-Rocket-Simulator',
        kind: 'external',
      },
    ],
  },
  {
    id: 'experience',
    index: 5,
    kind: 'experience',
    navLabel: 'Work Experience',
    title: 'Work Experience',
    eyebrow: 'Chatforce · U of T Blueprint · Bronze Bat Studio',
    period: '2023 — Present',
    position: [-5, 0, -26.4],
    accent: '#b66d3e',
    summary:
      'Product engineering, technical leadership, and game development across a fast-growing AI platform, two nonprofit builds, and an independent studio.',
    metric: '3 roles',
    metricLabel: 'Engineering, leadership, and shipped games',
    timeline: [
      {
        role: 'Founding Engineer',
        organization: 'Chatforce',
        period: 'February 2026 — Present',
        location: 'Toronto, ON',
        bullets: [
          'Overhauled a Three.js agentic harness with architecture, MCP, and tool calls for a vision-driven multi-agent system inspired by OpenGame and OpenCode, increasing game publication rate by 20%.',
          'Built a Rust pixel-art upscaler using fused-argmax voters that scored 77% on pixel-bench.',
          'Developed FastAPI and Redis rate-limiting plus server-authoritative multiplayer supporting 5,000+ users.',
          'Promoted to Founding Engineer within months after helping drive user count by more than 900%.',
        ],
      },
      {
        role: 'Software Engineer / Project Lead',
        organization: 'U of T Blueprint',
        period: 'September 2025 — May 2026',
        location: 'Toronto, ON',
        image: blueprintImage,
        bullets: [
          'Led a team of 10 developers building software for two nonprofit organizations.',
          'Built JWT authentication and middleware, an admin dashboard, and CSV data management with Django REST and React for the Museum of Art and Digital Entertainment in California.',
        ],
      },
      {
        role: 'Owner and Software Lead',
        organization: 'Bronze Bat Studio',
        period: 'August 2023 — Present',
        location: 'Richmond Hill, ON',
        image: twinUniverseImage,
        bullets: [
          'Direct an indie game studio building mechanics, physics algorithms, and networking in Lua and C#.',
          'Published seven interactive titles across Steam and Roblox, reaching more than 3 million plays and $2,000 in revenue.',
        ],
      },
    ],
    tech: ['Three.js', 'Rust', 'FastAPI', 'Redis', 'Django', 'React', 'Lua', 'C#'],
  },
  {
    id: 'skills',
    index: 6,
    kind: 'skills',
    navLabel: 'Skills & Tools',
    title: 'Skills & Tools',
    eyebrow: 'Languages · Frameworks · AI/ML · Infrastructure',
    position: [4.25, 0, -26.35],
    accent: '#526f5c',
    summary:
      'The languages, frameworks, machine-learning tools, and infrastructure used across shipped products and games.',
    metric: '25+',
    metricLabel: 'Technologies used in shipped work',
    skillGroups: [
      {
        label: 'Languages',
        items: ['Python', 'Java', 'C++', 'C#', 'JavaScript / TypeScript', 'SQL', 'Lua'],
      },
      {
        label: 'Frameworks',
        items: ['React', 'Next.js', 'Django', 'FastAPI', 'React Native'],
      },
      {
        label: 'AI & ML',
        items: ['PyTorch', 'LangChain', 'Hugging Face', 'RAG', 'Diffusion Models (SDXL)'],
      },
      {
        label: 'Tools & Infrastructure',
        items: ['Linux / Unix', 'Git', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'Neo4j', 'WebSockets'],
      },
    ],
  },
] as const

export const exhibitById = new Map(exhibits.map((exhibit) => [exhibit.id, exhibit]))

export const contactDetails = {
  location: 'Toronto, Ontario',
  email: 'cyiphoilee@mail.utoronto.ca',
  phone: '+1 (647) 534-9789',
  github: 'github.com/CaellumYHL',
  linkedin: 'linkedin.com/in/caellum-yip-hoi-lee-29242b30b',
} as const

export const totalExhibits = exhibits.length
