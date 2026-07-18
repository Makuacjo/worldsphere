import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { allWildlife } from '../data';
import { getOptimizedImage } from '../utils/cloudinary';
import Reveal from '../components/Reveal';
import '../index.css';

const SpeciesDetails = () => {
  const { id } = useParams<{ id: string }>();
  const entry = allWildlife.find(item => item.id === id);

  if (!entry) {
    return (
      <Container className="text-center page-shell">
        <h2 style={{ color: 'var(--text-color)' }}>Field Note Not Found</h2>
        <Link to="/" style={{ color: 'var(--highlight-color)' }}>Return to WorldSphere</Link>
      </Container>
    );
  }

  const subtitle = entry.category === 'water' ? entry.region : entry.scientificName;

  return (
    <main style={{ backgroundColor: 'var(--surface-color)', minHeight: '100vh' }}>
      <section
        className="species-hero"
        style={{
          backgroundImage: `url(${getOptimizedImage(entry.image, 'hero')})`,
          viewTransitionName: 'species-media',
        }}
      >
        <Container>
          <span className="species-hero__badge">{entry.category}</span>
          <h1 className="species-hero__title">{entry.name}</h1>
          <p className="species-hero__sub">{subtitle}</p>
        </Container>
      </section>

      <Container style={{ marginTop: '-3.5rem', position: 'relative', zIndex: 2, paddingBottom: 'var(--space-xl)' }}>
        <Row className="justify-content-center">
          <Col lg={9}>
            <Reveal>
              <div className="species-facts mb-5">
                <div>
                  <small>Classification</small>
                  <strong className="text-capitalize">{entry.category}</strong>
                </div>
                {entry.category === 'animal' && (
                  <div><small>Status</small><strong>{entry.status}</strong></div>
                )}
                {entry.category === 'plant' && (
                  <div><small>Season</small><strong>{entry.growthSeason}</strong></div>
                )}
                {entry.category === 'water' && (
                  <div><small>Type</small><strong>{entry.bodyType}</strong></div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <article className="species-article markdown-content">
                <ReactMarkdown>{entry.content}</ReactMarkdown>
                <hr className="my-5" style={{ borderColor: 'color-mix(in oklab, var(--secondary-color) 40%, transparent)' }} />
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <p className="mb-0 small" style={{ color: 'var(--secondary-color)' }}>
                    Source: WorldSphere Research Database
                  </p>
                  <Link to={`/${entry.category}s`} viewTransition className="btn btn-solar btn-sm">
                    Back to {entry.category}s
                  </Link>
                </div>
              </article>
            </Reveal>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SpeciesDetails;
