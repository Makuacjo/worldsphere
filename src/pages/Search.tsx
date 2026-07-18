import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { allWildlife } from '../data';
import AnimatedCardGrid from '../components/AnimatedCardGrid';
import type { WildlifeEntry } from '../types/wildlife';

type CategoryFilter = 'all' | 'animal' | 'plant' | 'water';

// Water has no scientificName (region instead), so searchable text is assembled
// per-category rather than reading a shared field.
const searchableText = (entry: WildlifeEntry): string => {
  const identifier = entry.category === 'water' ? entry.region : entry.scientificName;
  return `${entry.name} ${identifier} ${entry.summary}`.toLowerCase();
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const results = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return allWildlife.filter(entry => {
      const matchesCategory = category === 'all' || entry.category === category;
      const matchesQuery = trimmedQuery === '' || searchableText(entry).includes(trimmedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSearchParams(value ? { q: value } : {});
  };

  return (
    <section className="page-shell">
      <Container>
        <div className="page-head">
          <p className="kicker">Search</p>
          <h1 className="page-head__title">Explore the Database</h1>
          <p className="page-head__lede">
            Search across every animal, plant, and water body in the WorldSphere catalog.
          </p>
        </div>

        <Row className="filter-bar gy-3">
          <Col md={7}>
            <Form.Control
              type="search"
              placeholder="Search by name, species, or summary…"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
            />
          </Col>
          <Col md={5}>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value as CategoryFilter)}>
              <option value="all">All Categories</option>
              <option value="animal">Animals</option>
              <option value="plant">Plants</option>
              <option value="water">Waters</option>
            </Form.Select>
          </Col>
        </Row>

        <AnimatedCardGrid
          entries={results}
          emptyLabel={query.trim() ? `No entries match “${query}”.` : 'Type something to search, or pick a category.'}
        />
      </Container>
    </section>
  );
};

export default Search;
