/**
 * GBIF (Global Biodiversity Information Facility) client — https://www.gbif.org
 * Free, keyless, CORS-enabled. Powers the Explore surface with real species.
 */

const API = 'https://api.gbif.org/v1';

// highertaxonKey values for kingdom filtering.
export const KINGDOM = { Animals: 1, Plants: 6, Fungi: 5 } as const;
export type KingdomKey = keyof typeof KINGDOM;

export class GbifError extends Error {}

export interface GbifTaxon {
  key: number;
  canonicalName?: string;
  scientificName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  rank?: string;
  vernacularNames?: { vernacularName: string; language?: string }[];
  threatStatuses?: string[];
}

export interface GbifCard {
  key: number;
  name: string;         // best common name, else scientific
  scientificName: string;
  kingdom: string;
  status?: string;      // IUCN code: LC/NT/VU/EN/CR/…
  image?: string;
}

const STATUS_CODE: Record<string, string> = {
  LEAST_CONCERN: 'LC',
  NEAR_THREATENED: 'NT',
  VULNERABLE: 'VU',
  ENDANGERED: 'EN',
  CRITICALLY_ENDANGERED: 'CR',
  EXTINCT: 'EX',
  EXTINCT_IN_THE_WILD: 'EW',
  DATA_DEFICIENT: 'DD',
};

export const STATUS_LABEL: Record<string, string> = {
  LC: 'Least Concern', NT: 'Near Threatened', VU: 'Vulnerable',
  EN: 'Endangered', CR: 'Critically Endangered', EX: 'Extinct',
  EW: 'Extinct in the Wild', DD: 'Data Deficient',
};

const request = async <T>(path: string): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`);
  } catch {
    throw new GbifError('Could not reach GBIF. Check your connection and try again.');
  }
  if (!res.ok) throw new GbifError(`GBIF request failed (${res.status}).`);
  return res.json() as Promise<T>;
};

const englishName = (t: GbifTaxon): string | undefined => {
  const vn = t.vernacularNames ?? [];
  const eng = vn.find(v => v.language === 'eng') ?? vn[0];
  return eng?.vernacularName;
};

const titleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

export const toCard = (t: GbifTaxon): GbifCard => {
  const common = englishName(t);
  const sci = t.canonicalName ?? t.scientificName ?? 'Unknown species';
  const raw = (t.threatStatuses ?? [])[0];
  return {
    key: t.key,
    name: common ? titleCase(common) : sci,
    scientificName: sci,
    kingdom: t.kingdom ?? '—',
    status: raw ? STATUS_CODE[raw] : undefined,
  };
};

interface SearchResult { count: number; results: GbifTaxon[]; }

export const searchSpecies = async (
  query: string,
  opts: { kingdom?: KingdomKey; limit?: number; offset?: number } = {}
): Promise<{ total: number; cards: GbifCard[] }> => {
  const { kingdom, limit = 18, offset = 0 } = opts;
  const params = new URLSearchParams({
    q: query,
    rank: 'SPECIES',
    status: 'ACCEPTED',
    limit: String(limit),
    offset: String(offset),
  });
  if (kingdom) params.set('highertaxonKey', String(KINGDOM[kingdom]));

  const data = await request<SearchResult>(`/species/search?${params}`);
  // De-dupe by key and keep only taxa we can name.
  const seen = new Set<number>();
  const cards: GbifCard[] = [];
  for (const t of data.results) {
    if (!t.key || seen.has(t.key)) continue;
    seen.add(t.key);
    cards.push(toCard(t));
  }
  return { total: data.count, cards };
};

// Cache representative images so cards don't refetch across renders.
const imageCache = new Map<number, string | null>();

export const fetchTaxonImage = async (key: number): Promise<string | null> => {
  if (imageCache.has(key)) return imageCache.get(key)!;
  try {
    const data = await request<{ results: { media?: { identifier?: string; type?: string }[] }[] }>(
      `/occurrence/search?taxonKey=${key}&mediaType=StillImage&limit=1`
    );
    const url = data.results?.[0]?.media?.find(m => m.identifier)?.identifier ?? null;
    imageCache.set(key, url);
    return url;
  } catch {
    imageCache.set(key, null);
    return null;
  }
};

// ---- detail page helpers --------------------------------------------------

export const getSpecies = (key: number) => request<GbifTaxon>(`/species/${key}`);

export const getDescription = async (key: number): Promise<string | null> => {
  const data = await request<{ results: { description?: string; type?: string }[] }>(
    `/species/${key}/descriptions?limit=8`
  );
  const best = data.results?.find(d => (d.description ?? '').length > 80) ?? data.results?.[0];
  const text = best?.description;
  if (!text) return null;
  // GBIF descriptions can carry HTML — strip tags for safe plain rendering.
  return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

export const getGallery = async (key: number, n = 8): Promise<string[]> => {
  const data = await request<{ results: { media?: { identifier?: string }[] }[] }>(
    `/occurrence/search?taxonKey=${key}&mediaType=StillImage&limit=${n}`
  );
  const urls = (data.results ?? [])
    .map(r => r.media?.find(m => m.identifier)?.identifier)
    .filter((u): u is string => !!u);
  return Array.from(new Set(urls));
};

export const getOccurrenceCount = async (key: number): Promise<number> => {
  const data = await request<{ count: number }>(`/occurrence/search?taxonKey=${key}&limit=0`);
  return data.count;
};

export const getCountries = async (key: number): Promise<string[]> => {
  const data = await request<{ results: { country?: string; locality?: string }[] }>(
    `/species/${key}/distributions?limit=30`
  );
  const set = new Set<string>();
  for (const d of data.results ?? []) if (d.country) set.add(titleCase(d.country.toLowerCase()));
  return Array.from(set).slice(0, 8);
};

export const gbifOrgUrl = (key: number) => `https://www.gbif.org/species/${key}`;
