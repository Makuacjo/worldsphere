import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Navigate, Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const favLink = (source: string, key: string) =>
  source === 'gbif' ? `/explore/${key}` : `/species/${key}`;

const Profile = () => {
  const { user, isAuthenticated, loading, logout, favorites, toggleFavorite } = useAuth();
  const { theme, setTheme } = useTheme();

  if (loading) {
    return (
      <section className="page-shell">
        <div className="container text-center">
          <Spinner animation="border" style={{ color: 'var(--highlight-color)' }} />
        </div>
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="page-shell">
      <Container>
        <Row className="justify-content-center">
          <Col lg={9}>
            <div className="panel p-4 p-md-5 mb-4">
              <p className="kicker mb-2">Your Profile</p>
              <h2 className="fw-bold mb-1" style={{ color: 'var(--text-color)' }}>{user.name}</h2>
              <p className="mb-0" style={{ color: 'var(--secondary-color)' }}>{user.email}</p>
            </div>

            {/* Favorites */}
            <div className="panel p-4 p-md-5 mb-4">
              <h5 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-color)' }}>
                <Heart size={18} strokeWidth={2} /> Saved species
              </h5>
              <p className="small mb-4" style={{ color: 'var(--ink-dim)' }}>
                {favorites.length} saved
              </p>

              {favorites.length === 0 ? (
                <p className="empty-note mb-0">
                  Nothing saved yet. Tap the heart on any species in <Link to="/explore" style={{ color: 'var(--highlight-color)' }}>Explore</Link>.
                </p>
              ) : (
                <div className="fav-grid">
                  {favorites.map(f => (
                    <div key={`${f.source}:${f.key}`} className="fav-item">
                      <Link to={favLink(f.source, f.key)} className="fav-item__media">
                        {f.image ? <img src={f.image} alt={f.name} loading="lazy" /> : <div className="fav-item__ph" />}
                      </Link>
                      <div className="fav-item__body">
                        <Link to={favLink(f.source, f.key)} className="fav-item__name">{f.name}</Link>
                        {f.scientificName && <span className="fav-item__sci">{f.scientificName}</span>}
                      </div>
                      <button
                        type="button"
                        className="fav-item__remove"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => toggleFavorite({ source: f.source, key: f.key, name: f.name, scientificName: f.scientificName, image: f.image })}
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="panel p-4 p-md-5 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-color)' }}>Settings</h5>
              <p className="small mb-2" style={{ color: 'var(--secondary-color)' }}>Theme</p>
              <div className="d-flex gap-2" role="group" aria-label="Theme selection">
                <Button
                  variant={theme === 'light' ? undefined : 'outline-secondary'}
                  onClick={() => setTheme('light')}
                  style={theme === 'light' ? { backgroundColor: 'var(--highlight-color)', color: '#0C1114', border: 'none' } : undefined}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? undefined : 'outline-secondary'}
                  onClick={() => setTheme('dark')}
                  style={theme === 'dark' ? { backgroundColor: 'var(--highlight-color)', color: '#0C1114', border: 'none' } : undefined}
                >
                  Dark
                </Button>
              </div>
            </div>

            <Button variant="outline-danger" onClick={logout}>Log Out</Button>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Profile;
