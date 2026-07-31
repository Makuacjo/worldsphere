import { useState, type FormEvent } from 'react';
import { Alert, Form, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, BarChart3, CheckCircle2, MapPin, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import {
  predictConservationRisk, ConservationApiError,
  type PredictionRequest, type PredictionResponse,
  type TaxClass, type Habitat, type Region, type PopulationTrend,
} from '../services/conservationApi';
import { CATEGORY_COLORS } from '../utils/chartColors';
import './risk-predictor.css';

const CLASS_OPTIONS: TaxClass[] = ['Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii'];
const HABITAT_OPTIONS: Habitat[] = ['Forest', 'Grassland', 'Wetland', 'Marine', 'Freshwater', 'Desert', 'Mountain'];
const REGION_OPTIONS: Region[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const TREND_OPTIONS: PopulationTrend[] = ['Decreasing', 'Stable', 'Increasing', 'Unknown'];

const RiskPredictorPanel = () => {
  const [form, setForm] = useState<PredictionRequest>({
    class: 'Mammalia',
    habitat: 'Forest',
    region: 'Africa',
    population_trend: 'Decreasing',
    range_size_km2: 5000,
    generation_length_years: 8,
  });
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = <K extends keyof PredictionRequest>(key: K, value: PredictionRequest[K]) => {
    setForm(previous => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await predictConservationRisk(form));
    } catch (caught) {
      setError(caught instanceof ConservationApiError ? caught.message : 'The prediction could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.probabilities.map(probability => ({
    name: probability.category,
    value: Math.round(probability.probability * 100),
  })) ?? [];

  return (
    <div className="risk-workspace">
      <section className="risk-panel risk-panel--form" aria-labelledby="risk-profile-title">
        <div className="risk-panel__head">
          <div>
            <h3 id="risk-profile-title">Species profile</h3>
            <p>Describe the species and its current ecological conditions.</p>
          </div>
          <span className="risk-panel__icon" aria-hidden="true"><SlidersHorizontal size={20} /></span>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="risk-form-grid">
            <Form.Group className="risk-field">
              <Form.Label>Taxonomic class</Form.Label>
              <Form.Select value={form.class} onChange={(event) => updateField('class', event.target.value as TaxClass)}>
                {CLASS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="risk-field">
              <Form.Label>Habitat</Form.Label>
              <Form.Select value={form.habitat} onChange={(event) => updateField('habitat', event.target.value as Habitat)}>
                {HABITAT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="risk-field">
              <Form.Label>Region</Form.Label>
              <Form.Select value={form.region} onChange={(event) => updateField('region', event.target.value as Region)}>
                {REGION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="risk-field">
              <Form.Label>Population trend</Form.Label>
              <Form.Select value={form.population_trend} onChange={(event) => updateField('population_trend', event.target.value as PopulationTrend)}>
                {TREND_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="risk-field">
              <Form.Label>Range size (km²)</Form.Label>
              <Form.Control type="number" min={1} value={form.range_size_km2} onChange={(event) => updateField('range_size_km2', Number(event.target.value))} />
            </Form.Group>

            <Form.Group className="risk-field">
              <Form.Label>Generation length (years)</Form.Label>
              <Form.Control type="number" min={0.1} step={0.1} value={form.generation_length_years} onChange={(event) => updateField('generation_length_years', Number(event.target.value))} />
            </Form.Group>
          </div>

          <button type="submit" disabled={loading} className="risk-submit">
            {loading && <Spinner animation="border" size="sm" />}
            {loading ? 'Calculating risk…' : 'Calculate conservation risk'}
          </button>
        </Form>
      </section>

      <section className="risk-panel risk-panel--result" aria-labelledby="risk-result-title" aria-live="polite">
        <div className="risk-panel__head">
          <div>
            <h3 id="risk-result-title">Prediction</h3>
            <p>Model output and probability distribution.</p>
          </div>
          <span className="risk-panel__icon" aria-hidden="true"><BarChart3 size={20} /></span>
        </div>

        {error && (
          <Alert className="risk-error">
            <strong>Prediction service unavailable</strong>
            <div className="small mt-2">{error}</div>
            <div className="small mt-2">Check the service connection, then submit the profile again.</div>
          </Alert>
        )}

        {!error && !result && !loading && (
          <div className="risk-empty">
            <span className="risk-empty__mark" aria-hidden="true"><ShieldCheck size={27} /></span>
            <h4>Build a risk estimate</h4>
            <p>Complete the profile to compare the model’s conservation categories and understand which outcome is most likely.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Category probability breakdown</li>
              <li><Activity size={16} /> Population and life-history signals</li>
              <li><MapPin size={16} /> Habitat and regional context</li>
            </ul>
          </div>
        )}

        {loading && (
          <div className="risk-empty">
            <span className="risk-empty__mark" aria-hidden="true"><Spinner animation="border" size="sm" /></span>
            <h4>Calculating the estimate</h4>
            <p>The model is comparing this profile with its learned conservation patterns.</p>
          </div>
        )}

        {result && (
          <div className="risk-result">
            <div className="risk-result__summary">
              <span className="risk-result__badge" style={{ backgroundColor: CATEGORY_COLORS[result.predicted_category] ?? 'var(--secondary-color)' }}>
                {result.predicted_category}
              </span>
              <strong>{result.category_label}</strong>
            </div>
            <div className="risk-chart">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="var(--ink-dim)" />
                  <YAxis type="category" dataKey="name" width={42} stroke="var(--ink-dim)" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="value" radius={[0, 5, 5, 0]}>
                    {chartData.map(entry => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? 'var(--secondary-color)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default RiskPredictorPanel;