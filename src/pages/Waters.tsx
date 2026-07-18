import { useMemo, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { waterData } from '../data/waters';
import AnimatedCardGrid from '../components/AnimatedCardGrid';
import type { Water } from '../types/wildlife';

type BodyTypeFilter = Water['bodyType'] | 'All';
const BODY_TYPE_OPTIONS: BodyTypeFilter[] = ['All', 'Freshwater', 'Marine'];

const Waters = () => {
  const [query, setQuery] = useState('');
  const [bodyType, setBodyType] = useState<BodyTypeFilter>('All');

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return waterData.filter(water => {
      const matchesBodyType = bodyType === 'All' || water.bodyType === bodyType;
      const matchesQuery = trimmedQuery === '' ||
        `${water.name} ${water.region} ${water.summary}`.toLowerCase().includes(trimmedQuery);
      return matchesBodyType && matchesQuery;
    });
  }, [query, bodyType]);

  return (
    <section className="page-shell">
      <Container>
        <div className="page-head">
          <p className="kicker">Aquatic Ecosystems</p>
          <h1 className="page-head__title">Water Bodies Encyclopedia</h1>
          <p className="page-head__lede">
            The rivers, lakes, and oceans that carry life across the planet — and the
            diverse ecosystems they sustain.
          </p>
        </div>

        <Row className="filter-bar gy-3">
          <Col md={7}>
            <Form.Control
              type="search"
              placeholder="Search waters by name or region…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Col>
          <Col md={5}>
            <Form.Select value={bodyType} onChange={(e) => setBodyType(e.target.value as BodyTypeFilter)}>
              {BODY_TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>{option === 'All' ? 'All Body Types' : option}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <AnimatedCardGrid entries={filtered} emptyLabel="No water bodies match your search." />
      </Container>
    </section>
  );
};

export default Waters;
