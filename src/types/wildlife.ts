interface BaseEntry {
    id: string;
    name: string;
    image: string;
    summary: string;
    content: string;
    isFeatured: boolean;
}

export interface Animal extends BaseEntry {
    category: 'animal';
    status: 'Critical' | 'Endangered' | 'Vulnerable' | 'Stable';
    habitat: string;
    scientificName: string;
}

export interface Plants extends BaseEntry {
    category: 'plant';
    growthSeason: string;
    scientificName: string;
    uses?: string;
}

export interface Water extends BaseEntry {
    category: 'water';
    bodyType: 'Freshwater' | 'Marine';
    region: string;
}

// Helper type for components that can handle any of the three
export type WildlifeEntry = Animal | Plants | Water;