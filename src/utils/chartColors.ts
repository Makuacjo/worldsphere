// Fixed hex (not CSS variables) since these need to stay visually distinct
// and consistent in meaning (red = worse) regardless of light/dark theme.
export const CATEGORY_COLORS: Record<string, string> = {
    CR: '#8B2E2E', // Critically Endangered
    EN: '#C97A7A', // Endangered
    VU: '#D9A441', // Vulnerable
    NT: '#7C9C89', // Near Threatened
    LC: '#4E6A5B', // Least Concern
};

// General-purpose qualitative palette for charts with categories that
// aren't risk levels (taxonomic class, population trend, etc.)
export const QUALITATIVE_COLORS = ['#A68D4A', '#4E6A5B', '#C97A7A', '#7C9C89', '#DEDCCF', '#283B28'];
