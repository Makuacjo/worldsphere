import { useMemo, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { plantData } from '../data/plants';
import AnimatedCardGrid from '../components/AnimatedCardGrid';

const Plants = () => {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');

  // growthSeason is free text, so options are derived from the data itself.
  const seasonOptions = useMemo(
    () => ['All', ...Array.from(new Set(plantData.map(p => p.growthSeason)))],
    []
  );

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return plantData.filter(plant => {
      const matchesSeason = season === 'All' || plant.growthSeason === season;
      const matchesQuery = trimmedQuery === '' ||
        `${plant.name} ${plant.scientificName} ${plant.summary}`.toLowerCase().includes(trimmedQuery);
      return matchesSeason && matchesQuery;
    });
  }, [query, season]);

  return (
    <section className="page-shell">
      <Container>
        <div className="page-head">
          <p className="kicker">Flora Registry</p>
          <h1 className="page-head__title">Botanical Encyclopedia</h1>
          <p className="page-head__lede">
            From ancient trees to rare rainforest ferns — field notes and ecological data
            for the plants that anchor life on land.
          </p>
        </div>

        <Row className="filter-bar gy-3">
          <Col md={7}>
            <Form.Control
              type="search"
              placeholder="Search plants by name or species…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Col>
          <Col md={5}>
            <Form.Select value={season} onChange={(e) => setSeason(e.target.value)}>
              {seasonOptions.map(option => (
                <option key={option} value={option}>{option === 'All' ? 'All Growth Seasons' : option}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <AnimatedCardGrid entries={filtered} emptyLabel="No plants match your search." />
      </Container>
    </section>
  );
};

export default Plants;
