export interface BulletinEntry {
  id: string;
  code: string;
  title: string;
  date: string;
  type: 'release' | 'system_update';
  content: string;
  tags: string[];
}

export const bulletinEntries: BulletinEntry[] = [
  {
    id: 'bul-004',
    code: 'BUL-2026-04',
    title: 'Initial Distribution Window Scheduled',
    date: '2026-04-18',
    type: 'release',
    content: `First distribution window scheduled.\n\nRelease expected within 14–21 days.\nAvailability will be limited to initial batch quantities.\n\nFurther timing will be confirmed as readiness stabilizes.`,
    tags: ['distribution', 'release'],
  },
  {
    id: 'bul-003',
    code: 'BUL-2026-03',
    title: 'Packaging and Processing Phase Initiated',
    date: '2026-04-10',
    type: 'system_update',
    content: `Packaging systems now in development.\nLabeling, containment, and distribution formatting underway.\n\nUnits being prepared for controlled release.`,
    tags: ['packaging', 'processing'],
  },
  {
    id: 'bul-002',
    code: 'BUL-2026-02',
    title: 'Compound Set — Finalization in Progress',
    date: '2026-03-28',
    type: 'system_update',
    content: `Initial compound set undergoing final review.\nForm, scale, and structural integrity being standardized.\n\nPreparation for first batch nearing completion.\n\nSystem Progress: 65% — Calibration Phase`,
    tags: ['compounds', 'calibration'],
  },
  {
    id: 'bul-001',
    code: 'BUL-2026-01',
    title: 'System Now Online',
    date: '2026-03-15',
    type: 'system_update',
    content: `Core system initialized.\nInterface layers stable.\nBulletin and distribution channels active.\n\nFurther updates will be logged as processes advance.`,
    tags: ['system', 'initialization'],
  },
];
