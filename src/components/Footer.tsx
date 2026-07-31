import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--foundation-color)', color: 'var(--on-dark-surface)', padding: '80px 0 30px' }}>
      <Container>
        <Row className="gy-4">
          {/* Brand & Mission */}
          <Col lg={4}>
            <img className="footer__brand-logo mb-3" src="/WorldSphere-Logo-Package/WorldSphere-Logo.png" alt="WorldSphere" />
            <p style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.7' }}>
              A digital sanctuary dedicated to documenting the Earth's biodiversity. 
              Our mission is to foster conservation through education and research 
              into the wild species that define our planet.
            </p>
          </Col>

          {/* Quick Exploration Links */}
          <Col lg={2} md={4} className="offset-lg-1">
            <h6 className="fw-bold mb-4" style={{ color: 'var(--highlight-color)' }}>EXPLORE</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/animals" className="text-decoration-none" style={{ color: 'var(--on-dark-surface)' }}>Wildlife</Link></li>
              <li className="mb-2"><Link to="/plants" className="text-decoration-none" style={{ color: 'var(--on-dark-surface)' }}>Flora</Link></li>
              <li className="mb-2"><Link to="/waters" className="text-decoration-none" style={{ color: 'var(--on-dark-surface)' }}>Waters</Link></li>
              <li className="mb-2"><Link to="/about" className="text-decoration-none" style={{ color: 'var(--on-dark-surface)' }}>About Us</Link></li>
            </ul>
          </Col>

          {/* Resources */}
          <Col lg={2} md={4}>
            <h6 className="fw-bold mb-4" style={{ color: 'var(--highlight-color)' }}>RESOURCES</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-muted">Field Notes</li>
              <li className="mb-2 text-muted">Conservation API</li>
              <li className="mb-2 text-muted">Open Data</li>
            </ul>
          </Col>

          {/* Contact/Newsletter */}
          <Col lg={3} md={4}>
            <h6 className="fw-bold mb-4" style={{ color: 'var(--highlight-color)', letterSpacing: '1px' }}>CONNECT</h6>

            {status !== 'success' ? (
              <>
                <p style={{ fontSize: '0.9rem', opacity: 0.85, lineHeight: '1.5' }}>
                  Join our network for field journal entries and global conservation updates.
                </p>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email || !email.includes('@')) {
                      setStatus('error');
                      return;
                    }
                    setStatus('submitting');
                    // Simulate API network latency response
                    setTimeout(() => setStatus('success'), 1200);
                  }}
                >
                  <div className="d-flex position-relative">
                    <input 
                      type="email" 
                      placeholder="Enter your email..." 
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      disabled={status === 'submitting'}
                      className="form-control shadow-none border-0" 
                      style={{ 
                        borderRadius: '4px 0 0 4px', 
                        backgroundColor: 'var(--on-dark-surface)',
                        color: 'var(--foundation-color)',
                        fontSize: '0.9rem',
                        padding: '12px'
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn d-flex align-items-center justify-content-center" 
                      style={{ 
                        backgroundColor: 'var(--highlight-color)', 
                        color: 'var(--foundation-color)', 
                        borderRadius: '0 4px 4px 0', 
                        fontWeight: 'bold',
                        minWidth: '70px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {status === 'submitting' ? (
                        <div 
                          className="spinner-border spinner-border-sm" 
                          role="status" 
                          style={{ color: 'var(--foundation-color)' }}
                        />
                      ) : 'JOIN'}
                    </button>
                  </div>
                    
                  {/* Real-time Inline Validation Feedback */}
                  {status === 'error' && (
                    <small className="d-block mt-2 fw-semibold" style={{ color: 'var(--error-color)', fontSize: '0.8rem' }}>
                      * Please enter a valid email address.
                    </small>
                  )}
                </form>
              </>
            ) : (
              /* Interactive Success State Overlay */
              <div 
                className="p-3 text-center animate-fade-in" 
                style={{ 
                  backgroundColor: 'rgba(46, 189, 196, 0.14)',
                  border: '1px solid var(--secondary-color)', 
                  borderRadius: '6px' 
                }}
              >
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>🌿</span>
                <h6 className="fw-bold mb-1" style={{ color: 'var(--highlight-color)' }}>Welcome to WorldSphere</h6>
                <p className="mb-0 small text-muted" style={{ color: 'var(--on-dark-surface)', opacity: 0.8 }}>
                  Your research connection has been securely initialized. Check your inbox soon.
                </p>
              </div>
            )}
          </Col>
        </Row>

        <hr className="my-5" style={{ borderColor: 'var(--secondary-color)' }} />

        <Row className="align-items-center">
          <Col className="text-center text-md-start">
            <p className="mb-0 small" style={{ opacity: 0.6 }}>
              &copy; {currentYear} WorldSphere. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
