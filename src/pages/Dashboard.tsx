import { useEffect, useState, type ReactNode, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useCountUp } from '../hooks/useCountUp';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { animalData } from '../data/animals';
import { plantData } from '../data/plants';
import { waterData } from '../data/waters';
import { allWildlife } from '../data';
import { fetchConservationInsights, ConservationApiError, type InsightsResponse } from '../services/conservationApi';
import { CATEGORY_COLORS, QUALITATIVE_COLORS } from '../utils/chartColors';

const countBy = <T,>(items: T[], key: (item: T) => string): { name: string; count: number }[] => {
    const counts = items.reduce<Record<string, number>>((acc, item) => {
        const k = key(item);
        acc[k] = (acc[k] ?? 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
};

const recordToChartData = (record: Record<string, number>): { name: string; count: number }[] =>
    Object.entries(record).map(([name, count]) => ({ name, count }));

// Animates from 0 to the target once on mount (and on any later change).
const StatNumber = ({ value }: { value: number }) => {
    const v = useCountUp(value);
    return <>{v.toLocaleString()}</>;
};

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
    <div className="stat">
        <div className="stat__value text-capitalize">
            {typeof value === 'number' ? <StatNumber value={value} /> : value}
        </div>
        <p className="stat__label">{label}</p>
    </div>
);

const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="chart-card">
        <h5 className="chart-card__title">{title}</h5>
        <ResponsiveContainer width="100%" height={280}>
            {children as ReactElement}
        </ResponsiveContainer>
    </div>
);

const Dashboard = () => {
    // --- WildSphere's own curated encyclopedia entries (small, hand-written) ---
    const categoryData = [
        { name: 'Animals', count: animalData.length },
        { name: 'Plants', count: plantData.length },
        { name: 'Waters', count: waterData.length },
    ];
    const bodyTypeData = countBy(waterData, w => w.bodyType);
    const seasonData = countBy(plantData, p => p.growthSeason);
    const featuredCount = allWildlife.filter(entry => entry.isFeatured).length;

    // --- Live data from the Python ml-service (600-species training set) ---
    const [insights, setInsights] = useState<InsightsResponse | null>(null);
    const [insightsError, setInsightsError] = useState('');
    const [insightsLoading, setInsightsLoading] = useState(true);

    useEffect(() => {
        fetchConservationInsights()
            .then(setInsights)
            .catch(err => setInsightsError(err instanceof ConservationApiError ? err.message : 'Could not load model insights.'))
            .finally(() => setInsightsLoading(false));
    }, []);

    const importanceData = insights?.feature_importance.map(f => ({
        name: f.feature.replace(/_/g, ' '),
        value: Math.round(f.importance * 100),
    })) ?? [];
    const categoryDistributionData = insights ? recordToChartData(insights.category_distribution) : [];
    const classDistributionData = insights ? recordToChartData(insights.class_distribution) : [];
    const trendDistributionData = insights ? recordToChartData(insights.population_trend_distribution) : [];
    const riskByGenerationData = insights?.risk_by_generation_length.map(r => ({
        name: r.bucket, rate: Math.round(r.high_risk_rate * 100), count: r.species_count,
    })) ?? [];
    const riskByRangeData = insights?.risk_by_range_size.map(r => ({
        name: r.bucket, rate: Math.round(r.high_risk_rate * 100), count: r.species_count,
    })) ?? [];

    return (
        <section className="page-shell">
            <Container>
                <div className="page-head d-flex flex-wrap justify-content-between align-items-end gap-3">
                    <div>
                        <p className="kicker">Research</p>
                        <h1 className="page-head__title">What the data is learning</h1>
                        <p className="page-head__lede mb-0">A living research feed — the WorldSphere catalog and the patterns the conservation model has surfaced.</p>
                    </div>
                    <Link to="/ai" className="btn btn-solar">
                        Open AI Explorer &rarr;
                    </Link>
                </div>

                {/* ================= Section 1: WildSphere's own catalog ================= */}
                <p className="kicker">Your WildSphere Catalog</p>
                <p className="text-muted small mb-4">The species entries you've written up in the encyclopedia — small and curated by design.</p>

                <Row className="g-4 mb-4">
                    <Col md={3} sm={6}><StatCard label="Total Entries" value={allWildlife.length} /></Col>
                    <Col md={3} sm={6}><StatCard label="Animals" value={animalData.length} /></Col>
                    <Col md={3} sm={6}><StatCard label="Plants" value={plantData.length} /></Col>
                    <Col md={3} sm={6}><StatCard label="Waters" value={waterData.length} /></Col>
                </Row>

                <Row className="g-4">
                    <Col lg={6}>
                        <ChartCard title="Entries by Category">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                <XAxis dataKey="name" stroke="var(--text-color)" />
                                <YAxis allowDecimals={false} stroke="var(--text-color)" />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--highlight-color)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartCard>
                    </Col>

                    <Col lg={6}>
                        <ChartCard title="Water Body Types">
                            <PieChart>
                                <Pie data={bodyTypeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                    {bodyTypeData.map((entry, index) => (
                                        <Cell key={entry.name} fill={QUALITATIVE_COLORS[index % QUALITATIVE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ChartCard>
                    </Col>

                    <Col lg={12}>
                        <ChartCard title="Plant Growth Seasons">
                            <BarChart data={seasonData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                <XAxis type="number" allowDecimals={false} stroke="var(--text-color)" />
                                <YAxis type="category" dataKey="name" width={100} stroke="var(--text-color)" />
                                <Tooltip />
                                <Bar dataKey="count" fill="var(--secondary-color)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ChartCard>
                    </Col>
                </Row>

                <p className="text-muted small mt-4 mb-0">
                    {featuredCount} of {allWildlife.length} entries are currently marked as featured.
                </p>

                {/* ================= Section 2: live ml-service dataset & model ================= */}
                <div className="border-top pt-5 mt-5">
                    <p className="kicker">Powered by ml-service — 600-species training set</p>
                    <h2 className="fw-bold mb-4" style={{ color: 'var(--text-color)' }}>Conservation Risk Model Insights</h2>

                    {insightsLoading && (
                        <div className="d-flex align-items-center gap-2 text-muted">
                            <Spinner animation="border" size="sm" /> Loading model insights...
                        </div>
                    )}

                    {!insightsLoading && insightsError && (
                        <Alert variant="warning">
                            {insightsError}
                            <div className="small mt-2">
                                Start the ml-service to see this section live — see <code>ml-service/README.md</code>:
                                {' '}<code>python model/train.py</code> then <code>uvicorn app.main:app --reload --port 8000</code>.
                            </div>
                        </Alert>
                    )}

                    {insights && (
                        <Row className="g-4">
                            <Col md={4}>
                                <StatCard label="Model Accuracy" value={`${Math.round(insights.model_accuracy * 100)}%`} />
                            </Col>
                            <Col md={4}>
                                <StatCard label="Species in Training Set" value={insights.total_species} />
                            </Col>
                            <Col md={4}>
                                <StatCard
                                    label="Most Predictive Factor"
                                    value={insights.feature_importance[0]?.feature.replace(/_/g, ' ') ?? '—'}
                                />
                            </Col>

                            <Col lg={12}>
                                <ChartCard title="What Drives the Risk Prediction? (Feature Importance)">
                                    <BarChart data={importanceData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                        <XAxis type="number" unit="%" stroke="var(--text-color)" />
                                        <YAxis type="category" dataKey="name" width={140} stroke="var(--text-color)" />
                                        <Tooltip formatter={(value: number) => `${value}%`} />
                                        <Bar dataKey="value" fill="var(--highlight-color)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ChartCard>
                            </Col>

                            <Col lg={6}>
                                <ChartCard title="Conservation Status Across the Dataset">
                                    <PieChart>
                                        <Pie data={categoryDistributionData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                            {categoryDistributionData.map(entry => (
                                                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? 'var(--secondary-color)'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ChartCard>
                            </Col>

                            <Col lg={6}>
                                <ChartCard title="Species by Taxonomic Class">
                                    <BarChart data={classDistributionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                        <XAxis dataKey="name" stroke="var(--text-color)" angle={-15} textAnchor="end" height={50} />
                                        <YAxis allowDecimals={false} stroke="var(--text-color)" />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="var(--secondary-color)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartCard>
                            </Col>

                            <Col lg={6}>
                                <ChartCard title="Population Trend Across the Dataset">
                                    <PieChart>
                                        <Pie data={trendDistributionData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                                            {trendDistributionData.map((entry, index) => (
                                                <Cell key={entry.name} fill={QUALITATIVE_COLORS[index % QUALITATIVE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ChartCard>
                            </Col>

                            <Col lg={6}>
                                <ChartCard title="Risk Rate by Generation Length">
                                    <LineChart data={riskByGenerationData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                        <XAxis dataKey="name" stroke="var(--text-color)" />
                                        <YAxis unit="%" domain={[0, 100]} stroke="var(--text-color)" />
                                        <Tooltip formatter={(value: number) => `${value}%`} />
                                        <Line type="monotone" dataKey="rate" stroke="var(--highlight-color)" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ChartCard>
                            </Col>

                            <Col lg={6}>
                                <ChartCard title="Risk Rate by Range Size">
                                    <LineChart data={riskByRangeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-alt-color)" />
                                        <XAxis dataKey="name" stroke="var(--text-color)" angle={-15} textAnchor="end" height={60} />
                                        <YAxis unit="%" domain={[0, 100]} stroke="var(--text-color)" />
                                        <Tooltip formatter={(value: number) => `${value}%`} />
                                        <Line type="monotone" dataKey="rate" stroke="var(--secondary-color)" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ChartCard>
                            </Col>

                            <Col lg={12}>
                                <p className="text-muted small mb-0">
                                    "Risk rate" is the share of species in each bucket classified Vulnerable, Endangered, or
                                    Critically Endangered. Both lines reflect real patterns in the current training data — but
                                    remember it's still the synthetic starter dataset until you swap in real IUCN data (see{' '}
                                    <code>ml-service/README.md</code>).
                                </p>
                            </Col>
                        </Row>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default Dashboard;
