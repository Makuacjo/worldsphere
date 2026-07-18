const API_BASE_URL = import.meta.env.VITE_ML_API_URL ?? 'http://localhost:8000';

export type TaxClass = 'Mammalia' | 'Aves' | 'Reptilia' | 'Amphibia' | 'Actinopterygii';
export type Habitat = 'Forest' | 'Grassland' | 'Wetland' | 'Marine' | 'Freshwater' | 'Desert' | 'Mountain';
export type Region = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';
export type PopulationTrend = 'Decreasing' | 'Stable' | 'Increasing' | 'Unknown';

export interface PredictionRequest {
    class: TaxClass;
    habitat: Habitat;
    region: Region;
    population_trend: PopulationTrend;
    range_size_km2: number;
    generation_length_years: number;
}

export interface CategoryProbability {
    category: string;
    probability: number;
}

export interface PredictionResponse {
    predicted_category: string;
    category_label: string;
    probabilities: CategoryProbability[];
}

export interface FeatureImportance {
    feature: string;
    importance: number;
}

export interface RiskByBucket {
    bucket: string;
    species_count: number;
    high_risk_rate: number;
}

export interface InsightsResponse {
    total_species: number;
    category_distribution: Record<string, number>;
    class_distribution: Record<string, number>;
    population_trend_distribution: Record<string, number>;
    feature_importance: FeatureImportance[];
    model_accuracy: number;
    average_range_size_by_category: Record<string, number>;
    risk_by_generation_length: RiskByBucket[];
    risk_by_range_size: RiskByBucket[];
}

/**
 * Thrown when the API is unreachable or the model hasn't been trained yet
 * (see ml-service/README.md — `python model/train.py` first).
 */
export class ConservationApiError extends Error {}

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
    } catch {
        throw new ConservationApiError(
            `Could not reach the Conservation Insights API at ${API_BASE_URL}. Is ml-service running?`
        );
    }

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ConservationApiError(body?.detail ?? `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
};

export const predictConservationRisk = (payload: PredictionRequest): Promise<PredictionResponse> =>
    request<PredictionResponse>('/predict', { method: 'POST', body: JSON.stringify(payload) });

export const fetchConservationInsights = (): Promise<InsightsResponse> =>
    request<InsightsResponse>('/insights');
