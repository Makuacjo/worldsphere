import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import WildlifeCard from '../components/WildlifeCard';
import Reveal from '../components/Reveal';
import type { WildlifeEntry } from '../types/wildlife';

interface CategoryProps {
  title: string;
  subtitle: string;
  data: WildlifeEntry[];
  path: string;
  bgColor?: string;
}

const CategorySection = ({ title, subtitle, data, path, bgColor = 'var(--primary-color)' }: CategoryProps) => {
  return (
    <section style={{ backgroundColor: bgColor }} className="section">
      <Container>
        <Reveal>
          <div className="section__head">
            <div>
              <p className="kicker mb-2">{subtitle}</p>
              <h2 className="section__title">{title}</h2>
            </div>
            <Link to={path} className="section__more">
              Explore all <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        <Row className="g-4">
          {data.slice(0, 3).map((item, i) => (
            <Col key={item.id} md={4}>
              <Reveal delay={i * 0.08}>
                <WildlifeCard entry={item} />
              </Reveal>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default CategorySection;
