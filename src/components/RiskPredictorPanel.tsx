import { useState, type FormEvent } from 'react';
import { Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  predictConservationRisk, ConservationApiError,
  type PredictionRequest, type PredictionResponse,
  type TaxClass, type Habitat, type Region, type PopulationTrend,
} from '../services/conservationApi';
import { CATEGORY_COLORS } from '../utils/chartColors';

const CLASS_OPTIONS: TaxClass[] = ['Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii'];
const HABITAT_OPTIONS: Habitat[] = ['Forest', 'Grassland', 'Wetland', 'Marine', 'Freshwater', 'Desert', 'Mountain'];
const REGION_OPTIONS: Region[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const TREND_OPTIONS: PopulationTrend[] = ['Decreasing', 'Stable', 'Increasing', 'Unknown'];

/**
 * The conservation-risk predictor, wired to the ml-service /predict endpoint.
 * Extracted as a standalone panel so both the Risk Predictor page and the AI
 * Explorer can reuse the exact same logic without duplication.
 */
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
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await predictConservationRisk(form));
    } catch (err) {
      setError(err instanceof ConservationApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.probabilities.map(p => ({ name: p.category, value: Math.round(p.probability * 100) })) ?? [];

  return (
    <Row className="g-4">
      <Col lg={5}>
        <Card className="panel border-0 p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Taxonomic Class</Form.Label>
              <Form.Select value={form.class} onChange={(e) => updateField('class', e.target.value as TaxClass)}>
                {CLASS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Habitat</Form.Label>
              <Form.Select value={form.habitat} onChange={(e) => updateField('habitat', e.target.value as Habitat)}>
                {HABITAT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Region</Form.Label>
              <Form.Select value={form.region} onChange={(e) => updateField('region', e.target.value as Region)}>
                {REGION_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Population Trend</Form.Label>
              <Form.Select value={form.population_trend} onChange={(e) => updateField('population_trend', e.target.value as PopulationTrend)}>
                {TREND_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Range Size (km²)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.range_size_km2}
                onChange={(e) => updateField('range_size_km2', Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Generation Length (years)</Form.Label>
              <Form.Control
                type="number"
                min={0.1}
                step={0.1}
                value={form.generation_length_years}
                onChange={(e) => updateField('generation_length_years', Number(e.target.value))}
              />
            </Form.Group>

            <Button type="submit" disabled={loading} className="btn-solar w-100 justify-content-center">
              {loading && <Spinner animation="border" size="sm" />}
              {loading ? 'Predicting…' : 'Predict Risk'}
            </Button>
          </Form>
        </Card>
      </Col>

      <Col lg={7}>
        <Card className="panel border-0 p-4 h-100">
          <h5 className="fw-bold mb-3" style={{ color: 'var(--text-color)' }}>Prediction</h5>

          {error && (
            <Alert variant="warning">
              {error}
              <div className="small mt-2">
                Make sure the ml-service is running locally (see <code>ml-service/README.md</code>) —
                run <code>python model/train.py</code> then <code>uvicorn app.main:app --reload --port 8000</code>.
              </div>
            </Alert>
          )}

          {!error && !result && !loading && (
            <p style={{ color: 'var(--ink-dim)' }}>Fill in the traits and submit to see a predicted conservation risk category.</p>
          )}

          {result && (
            <>
              <div className="d-flex align-items-baseline gap-3 mb-4">
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{ backgroundColor: CATEGORY_COLORS[result.predicted_category] ?? 'var(--secondary-color)', color: '#fff', fontSize: '1rem' }}
                >
                  {result.predicted_category}
                </span>
                <span className="fw-bold" style={{ color: 'var(--text-color)' }}>{result.category_label}</span>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="var(--text-color)" />
                  <YAxis type="category" dataKey="name" width={40} stroke="var(--text-color)" />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map(entry => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? 'var(--secondary-color)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default RiskPredictorPanel;
