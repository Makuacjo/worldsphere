import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <Container className="text-center" style={{ paddingTop: '180px', paddingBottom: '120px', minHeight: '60vh' }}>
        <h1 className="display-3 fw-bold" style={{ color: 'var(--text-color)' }}>404</h1>
        <p className="lead" style={{ color: 'var(--secondary-color)' }}>This page has wandered off the trail.</p>
        <Link to="/" style={{ color: 'var(--highlight-color)' }}>Return Home</Link>
    </Container>
);

export default NotFound;
