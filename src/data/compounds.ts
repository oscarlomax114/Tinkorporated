export interface DoseOption {
  name: string;
  values: string[];
}

export interface Dose {
  id: string;
  productId: string;
  title: string;
  type: 'physical';
  price: number;
  inventory?: number;
  status: 'available' | 'depleted';
  composition: string;
  notes: string;
  administrationMethod: string;
  sideEffects?: string;
  options?: DoseOption;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  classification: string;
  format: 'standard' | 'xr';
  status: 'active' | 'archived';
  doses: Dose[];
}

export const products: Product[] = [
  {
    id: 'DSG-MD',
    name: 'Dosage — Mystery Dispense',
    description: 'Each dose contains one randomly assigned compound from the current batch. Contents remain unknown until opened. Current batch may include black, blue, pink, white/orange, and hand-painted variants. Outcomes are not selectable and probability is not uniform.',
    classification: 'Dose (2.5" Figure)',
    format: 'standard',
    status: 'active',
    doses: [
      {
        id: 'd-mystery',
        productId: 'DSG-MD',
        title: 'Mystery Dispense',
        type: 'physical',
        price: 12,
        status: 'available',
        composition: '2.5-inch figure, prescription-style container, compound assigned at random from current batch',
        notes: 'Each dose contains one randomly assigned compound from the current batch. Contents remain unknown until opened. Current batch may include black, blue, pink, white/orange, and hand-painted variants. Outcomes are not selectable and probability is not uniform.',
        administrationMethod: 'Ships within 3–5 business days via tracked courier.',
        sideEffects: 'Contents may differ from expectations. No exchanges on dispensed units.',
      },
    ],
  },
  {
    id: 'DSG-OS',
    name: 'Dosage — Open Selection',
    description: 'Select a specific compound from the current index. Each dose contains one standard issue (black) figure. Color and painted variants are not distributed through this method.',
    classification: 'Dose (2.5" Figure)',
    format: 'standard',
    status: 'active',
    doses: [
      {
        id: 'd-open',
        productId: 'DSG-OS',
        title: 'Open Selection',
        type: 'physical',
        price: 20,
        status: 'available',
        composition: '2.5-inch figure, prescription-style container, compound selected from current batch',
        notes: 'Select a specific compound from the current index. Each dose contains one standard issue (black) figure. Color and painted variants are not distributed through this method.',
        administrationMethod: 'Ships within 3–5 business days via tracked courier.',
        options: {
          name: 'Selection',
          values: ['F-HY1', 'F-RY1', 'F-N51', 'F-SU1', 'F-SS1', 'F-PC1', 'F-AS1', 'F-GR1', 'F-BL1', 'F-FZ1'],
        },
      },
    ],
  },
  {
    id: 'XR-001',
    name: 'Dosage XR — 001',
    description: 'Extended Release dose. Produced in limited quantity.',
    classification: 'Dose (5" Figure)',
    format: 'xr',
    status: 'active',
    doses: [
      {
        id: 'd-xr-001',
        productId: 'XR-001',
        title: 'Extended Release — 001',
        type: 'physical',
        price: 135,
        status: 'available',
        composition: '5-inch figure, hand-painted and individually finished',
        notes: 'Each unit is hand-painted and individually inspected. Minor variation between units is inherent to the process and not considered a defect.',
        administrationMethod: 'Ships within 5–10 business days via tracked courier. Made-to-order units may require additional processing time.',
        sideEffects: 'Each unit is unique. Exact replication is not possible.',
      },
    ],
  },
  {
    id: 'XR-002',
    name: 'Dosage XR — 002',
    description: 'Extended Release dose. Produced in limited quantity.',
    classification: 'Dose (5" Figure)',
    format: 'xr',
    status: 'active',
    doses: [
      {
        id: 'd-xr-002',
        productId: 'XR-002',
        title: 'Extended Release — 002',
        type: 'physical',
        price: 135,
        status: 'available',
        composition: '5-inch figure, hand-painted and individually finished',
        notes: 'Each unit is hand-painted and individually inspected. Minor variation between units is inherent to the process and not considered a defect.',
        administrationMethod: 'Ships within 5–10 business days via tracked courier. Made-to-order units may require additional processing time.',
        sideEffects: 'Each unit is unique. Exact replication is not possible.',
      },
    ],
  },
  {
    id: 'XR-003',
    name: 'Dosage XR — 003',
    description: 'Extended Release dose. Produced in limited quantity.',
    classification: 'Dose (5" Figure)',
    format: 'xr',
    status: 'active',
    doses: [
      {
        id: 'd-xr-003',
        productId: 'XR-003',
        title: 'Extended Release — 003',
        type: 'physical',
        price: 135,
        status: 'available',
        composition: '5-inch figure, hand-painted and individually finished',
        notes: 'Each unit is hand-painted and individually inspected. Minor variation between units is inherent to the process and not considered a defect.',
        administrationMethod: 'Ships within 5–10 business days via tracked courier. Made-to-order units may require additional processing time.',
        sideEffects: 'Each unit is unique. Exact replication is not possible.',
      },
    ],
  },
];

// Backward-compatible aliases
export type Compound = Product;
export const compounds = products;

// Helpers
export const activeProducts = products.filter(p => p.status === 'active');
export const archivedProducts = products.filter(p => p.status === 'archived');

export const standardDoses = activeProducts.filter(p => p.format === 'standard');
export const xrDoses = activeProducts.filter(p => p.format === 'xr');

// Legacy aliases used across the codebase
export const activeCompounds = activeProducts;
export const archivedCompounds = archivedProducts;

export const allDoses = products.flatMap(p => p.doses);
export const availableDoses = allDoses.filter(d => d.status === 'available');
export const depletedDoses = allDoses.filter(d => d.status === 'depleted');

export function getCompound(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
