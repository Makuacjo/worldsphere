import { useMemo, useState } from 'react';
import { Container, Col, Row, Form } from 'react-bootstrap';
import { animalData } from '../data/animals';
import AnimatedCardGrid from '../components/AnimatedCardGrid';
import type { Animal } from '../types/wildlife';

type StatusFilter = Animal['status'] | 'All';
const STATUS_OPTIONS: StatusFilter[] = ['All', 'Critical', 'Endangered', 'Vulnerable', 'Stable'];

const Animals = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return animalData.filter(animal => {
      const matchesStatus = status === 'All' || animal.status === status;
      const matchesQuery = trimmedQuery === '' ||
        `${animal.name} ${animal.scientificName} ${animal.summary}`.toLowerCase().includes(trimmedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  return (
    <section className="page-shell">
      <Container>
        <div className="page-head">
          <p className="kicker">Fauna Registry</p>
          <h1 className="page-head__title">Wildlife Encyclopedia</h1>
          <p className="page-head__lede">
            Field notes, conservation status, and ecological data for the animals that
            shape ecosystems across the globe.
          </p>
        </div>

        <Row className="filter-bar gy-3">
          <Col md={7}>
            <Form.Control
              type="search"
              placeholder="Search animals by name or species…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Col>
          <Col md={5}>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              {STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>{option === 'All' ? 'All Statuses' : option}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <AnimatedCardGrid entries={filtered} emptyLabel="No animals match your search." />
      </Container>
    </section>
  );
};

export default Animals;
