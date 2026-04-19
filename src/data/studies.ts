export interface Study {
  id: string;
  code: string;
  title: string;
  classification: string;
  date: string;
  status: 'complete' | 'ongoing';
  medium: string;
  abstract: string;
  notes: string[];
  linkedCompound?: string;
  tags: string[];
}

export const studies: Study[] = [
  {
    id: 'study-001',
    code: 'STD-001',
    title: 'Erosion Study',
    classification: 'Visual Research — Material',
    date: '2025-11',
    status: 'complete',
    medium: 'Photography, 3D scan, print',
    abstract: 'A systematic documentation of material degradation across 47 textile samples exposed to controlled environmental stressors over 120 days. The resulting imagery maps the intersection of entropy and design intent.',
    notes: [
      'Synthetic blends showed predictable failure patterns along stress lines.',
      'Natural fibers exhibited unique degradation signatures — no two samples matched.',
      'Final outputs selected for exhibition at Basel Material Conference 2026.',
    ],
    tags: ['material', 'photography', 'research'],
  },
  {
    id: 'study-002',
    code: 'STD-002',
    title: 'Mono Transmission',
    classification: 'Audio-Visual — Installation',
    date: '2026-01',
    status: 'complete',
    medium: 'Generative audio, projection, custom software',
    abstract: 'A 12-channel audio-visual installation translating figure construction data into spatial sound. Sculpting coordinates map to frequency, surface detail to amplitude, paint application to decay time.',
    notes: [
      'Each figure produced a unique 3–7 minute composition.',
      'Audience retention averaged 22 minutes.',
      'System published as open-source after exhibition close.',
    ],
    linkedCompound: 'DSG-001',
    tags: ['installation', 'generative', 'audio'],
  },
  {
    id: 'study-003',
    code: 'STD-003',
    title: 'Posture Index',
    classification: 'Photography — Documentary',
    date: '2026-02',
    status: 'complete',
    medium: 'Medium format film, archival print',
    abstract: 'A documentary series capturing the postural signatures of 30 subjects in clinical white environments. The study examines how the body inhabits standardized form.',
    notes: [
      'Subjects self-organized into 4 distinct postural categories without instruction.',
      'Printed as limited edition set of 30 — one per subject.',
      'Acquired by private collection, Zurich.',
    ],
    tags: ['photography', 'documentary', 'body'],
  },
  {
    id: 'study-004',
    code: 'STD-004',
    title: 'Type Specimen: Institutional',
    classification: 'Typography — Design System',
    date: '2025-09',
    status: 'complete',
    medium: 'Type design, print, digital specimen',
    abstract: 'Development of a proprietary monospaced typeface designed for pharmaceutical-grade labeling and institutional documentation. Four weights, full Latin character set, tabular figures.',
    notes: [
      'Optimized for legibility at 6pt on uncoated stock.',
      'Now deployed across all Tink product packaging and digital interfaces.',
      'Specimen book printed in edition of 100.',
    ],
    tags: ['typography', 'design-system', 'print'],
  },
  {
    id: 'study-005',
    code: 'STD-005',
    title: 'Paint Application Protocol',
    classification: 'Product Development — Testing',
    date: '2026-03',
    status: 'ongoing',
    medium: 'Hand-painting trials, photography, documentation',
    abstract: 'Ongoing controlled testing of hand-paint application methods for the Extended Release format. Each figure is subjected to multiple finishing techniques to determine optimal fidelity and durability.',
    notes: [
      'Phase 1 complete: acrylic base coat adhesion tested across 50 units.',
      'Phase 2 in progress: detail brush technique standardization.',
      'Results will inform finishing protocol for XR production.',
    ],
    linkedCompound: 'XR-001',
    tags: ['testing', 'product-development', 'xr'],
  },
];
