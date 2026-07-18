import { Container, Row, Col } from 'react-bootstrap';
import Reveal from '../components/Reveal';

const PILLARS = [
  {
    n: '01',
    title: 'Field Accuracy',
    body: 'Every component, fact box, and article mirrors professional scientific taxonomies and IUCN conservation classifications.',
  },
  {
    n: '02',
    title: 'Technical Scale',
    body: 'Built with modular schemas and image optimization so it serves global users smoothly, even on low-bandwidth networks.',
  },
  {
    n: '03',
    title: 'Open Education',
    body: 'We remove the walls between curiosity and research data, with clear pathways into wildlife, botany, and aquatic ecosystems.',
  },
];

const About = () => {
  return (
    <main style={{ backgroundColor: 'var(--primary-color)', minHeight: '100vh' }}>
      <section className="page-shell" style={{ background: 'transparent', paddingBottom: 'var(--space-lg)' }}>
        <Container className="text-center">
          <Reveal>
            <p className="kicker">Our Mission</p>
            <h1 className="page-head__title mx-auto" style={{ borderBottom: 'none' }}>
              The Architecture of WorldSphere
            </h1>
            <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--highlight-color)', margin: '1.5rem auto 0' }} />
          </Reveal>
        </Container>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Container>
          <Row className="align-items-center gy-5">
            <Col lg={6}>
              <Reveal>
                <h3 className="mb-4" style={{ color: 'var(--text-color)', fontSize: 'var(--step-3)' }}>
                  Bridging digital precision with the natural world.
                </h3>
                <p className="measure" style={{ color: 'var(--text-color)', fontSize: 'var(--step-1)', lineHeight: 1.7 }}>
                  WorldSphere is an open-access digital sanctuary engineered to document
                  global biodiversity. By combining technical software systems with field
                  biology, we give researchers, students, and conservationists a scalable
                  space to explore Earth's ecosystems.
                </p>
                <p className="measure" style={{ color: 'color-mix(in oklab, var(--text-color) 80%, transparent)', lineHeight: 1.7 }}>
                  We structure complex environmental data — from conservation vulnerability
                  metrics to botanical microclimates — into intuitive, fast-loading
                  interfaces. Robust, accessible open data is a core tool for modern
                  ecological preservation.
                </p>
              </Reveal>
            </Col>

            <Col lg={6} className="ps-lg-5">
              <Reveal delay={0.1}>
                <div className="about-frame">
                  <img
                    src="https://res.cloudinary.com/duuwn3dzm/image/upload/under-water_fswyjn.jpg"
                    alt="Underwater ecosystem representing global biodiversity"
                  />
                </div>
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section" style={{ backgroundColor: 'var(--foundation-color)', color: 'var(--on-dark-surface)' }}>
        <Container>
          <Reveal>
            <div className="text-center mb-5">
              <h2 style={{ color: '#fff', fontSize: 'var(--step-4)' }}>Core Design Principles</h2>
              <p style={{ color: 'var(--highlight-color)' }}>How we approach structural educational engineering</p>
            </div>
          </Reveal>

          <Row className="gy-4">
            {PILLARS.map((p, i) => (
              <Col md={4} key={p.n}>
                <Reveal delay={i * 0.08}>
                  <div className="about-pillar">
                    <h4>{p.n}. {p.title}</h4>
                    <p style={{ opacity: 0.85, lineHeight: 1.6, marginBottom: 0 }}>{p.body}</p>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default About;
