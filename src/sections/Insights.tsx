import { Container, Row, Col } from 'react-bootstrap';
import Reveal from '../components/Reveal';

const Insights = () => {
  return (
    <section className="section" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--text-color)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={9} xl={8} className="text-center">
            <Reveal>
              <div className="insights__rule" />
              <h2 className="insights__title">Understanding our living planet</h2>
              <p className="insights__lede measure mx-auto">
                Biodiversity is the heartbeat of Earth. From the great herds crossing the
                savanna to the microscopic plants oxygenating our oceans, every species
                plays a role in the web of life. WorldSphere bridges the gap between
                curiosity and conservation — so you can explore, learn, and protect the
                ecosystems that sustain us all.
              </p>
              <p className="insights__quote">
                “In every walk with nature, one receives far more than he seeks.”
                <span>— John Muir</span>
              </p>
            </Reveal>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Insights;
