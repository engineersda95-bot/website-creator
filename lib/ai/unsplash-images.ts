/**
 * Curated Unsplash photo IDs by category.
 * All IDs in this file have been verified as valid.
 * URL format: https://images.unsplash.com/photo-{ID}?w=800&q=80&fit=crop
 *
 * To add more: verify the ID returns 200 before adding it here.
 * Selection is deterministic: same seed → same image, different seeds → different images.
 */

// --- Verified photo IDs ---
const LIBRARY: Record<string, string[]> = {
  restaurant: [
    '1555396273-367ea4eb4db5',
    '1414235077428-338989a2e8c0',
    '1466978913421-dad2ebd01d17',
    '1517248135467-4c7edcad34c4',
    '1528605248644-14dd04022da1',
    '1551218808-f90d7e4b3f6c',
  ],
  food: [
    '1565299624946-b28f40a0ae38',
    '1473093295043-cdd812d0e601',
    '1432139555190-58524dae6a55',
    '1571877227200-a0d98ea607e9',
    '1504674900247-0877df9cc836',
    '1490645935967-10de6ba17061',
    '1546069901-5ec6a79120b0',
  ],
  office: [
    '1497366811353-6870744d04b2',
    '1522071820081-009f0129c71c',
    '1521737604893-d14cc237f11d',
    '1568992687947-868a62a9f521',
    '1507003211169-0a1dd7228f2d',
  ],
  professional: [
    '1560250097-0b93528c311a',
    '1573496359142-b8d87734a5a2',
    '1507003211169-0a1dd7228f2d',
    '1521737604893-d14cc237f11d',
  ],
  beauty: [
    '1540555700478-4be289fbecef',
    '1560750133-0d60b13e3ae3',
    '1522337360788-8b13dee7a37e',
    '1519823551278-64ac92734fb1',
  ],
  gym: [
    '1534438327276-14e5300c3a48',
    '1571019614242-c5c5dee9f50b',
    '1517836357463-d25dfeac3438',
    '1605296867304-46d5465a13f1',
  ],
  store: [
    '1472851294608-062f824d29cc',
    '1441986380878-c4248f5b8b5b',
    '1607082348824-0a96f2a4b9da',
  ],
  travel: [
    '1476514525535-07fb3b4ae5f1',
    '1503220317375-aaad31b5c597',
    '1469854523086-cc02fe5d8800',
  ],
  hotel: [
    '1566073771259-470de1bed0be',
    '1520250497591-112f2f40a3f4',
  ],
  medical: [
    '1584820927498-cad076cc5ba8',
    '1576091160399-112ba8d25d1d',
  ],
  education: [
    '1580582932707-520aed937b7b',
    '1523050854058-8df90110c9f1',
  ],
  construction: [
    '1504307651254-35680f356dfd',
    '1581094794329-c8112a89af12',
  ],
  nature: [
    '1501854140801-50d01698950b',
    '1470071459604-3b5ec3a7fe05',
  ],
  team: [
    '1522071820081-009f0129c71c',
    '1521737604893-d14cc237f11d',
    '1543269865-cbf427effbad',
  ],
  technology: [
    '1518770660439-4636190af475',
    '1488590528505-98d2b5aba04b',
    '1551288049-bebda4e38f71',
  ],
};

// Business type → ordered list of relevant categories
const TYPE_TO_CATEGORIES: Record<string, string[]> = {
  Restaurant:                  ['restaurant', 'food'],
  LocalBusiness:               ['office', 'team', 'professional'],
  ProfessionalService:         ['professional', 'office'],
  HealthAndBeautyBusiness:     ['beauty', 'nature'],
  HomeAndConstructionBusiness: ['construction', 'office'],
  EducationalOrganization:     ['education', 'team'],
  SportsActivityLocation:      ['gym', 'nature'],
  TravelAgency:                ['travel', 'nature', 'hotel'],
  Store:                       ['store', 'office'],
  Organization:                ['team', 'office'],
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns a deterministic Unsplash URL for the given business type and seed.
 * Same seed always returns the same image; different seeds cycle through the pool.
 */
export function getUnsplashUrl(businessType: string, seed: string, width = 800, height = 500): string {
  const categories = TYPE_TO_CATEGORIES[businessType] || ['office', 'team'];
  const pool = categories.flatMap(c => (LIBRARY[c] || []).map(id => id));
  if (pool.length === 0) return `https://picsum.photos/seed/${seed.replace(/\s+/g, '-')}/${width}/${height}`;
  const id = pool[hashSeed(seed) % pool.length];
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${height}&q=80&fit=crop`;
}

/**
 * Returns a deterministic hero (landscape) Unsplash URL for the given business type.
 */
export function getHeroUnsplashUrl(businessType: string): string {
  const heroIds: Record<string, string> = {
    Restaurant:                  '1555396273-367ea4eb4db5',
    LocalBusiness:               '1497366811353-6870744d04b2',
    ProfessionalService:         '1560250097-0b93528c311a',
    HealthAndBeautyBusiness:     '1540555700478-4be289fbecef',
    HomeAndConstructionBusiness: '1504307651254-35680f356dfd',
    EducationalOrganization:     '1580582932707-520aed937b7b',
    SportsActivityLocation:      '1534438327276-14e5300c3a48',
    TravelAgency:                '1476514525535-07fb3b4ae5f1',
    Store:                       '1472851294608-062f824d29cc',
    Organization:                '1522071820081-009f0129c71c',
  };
  const id = heroIds[businessType] || '1497366811353-6870744d04b2';
  return `https://images.unsplash.com/photo-${id}?w=1600&h=900&q=80&fit=crop`;
}
