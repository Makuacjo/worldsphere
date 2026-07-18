import { Container, Row, Col, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <section className="page-shell">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <div className="panel p-4 p-md-5 mb-4">
                            <p className="kicker mb-2">Your Profile</p>
                            <h2 className="fw-bold mb-1" style={{ color: 'var(--text-color)' }}>{user.name}</h2>
                            <p className="mb-0" style={{ color: 'var(--secondary-color)' }}>{user.email}</p>
                        </div>

                        <div className="panel p-4 p-md-5 mb-4">
                            <h5 className="fw-bold mb-3" style={{ color: 'var(--text-color)' }}>Settings</h5>
                            <p className="small mb-2" style={{ color: 'var(--secondary-color)' }}>Theme</p>
                            <div className="d-flex gap-2" role="group" aria-label="Theme selection">
                                <Button
                                    variant={theme === 'light' ? undefined : 'outline-secondary'}
                                    onClick={() => setTheme('light')}
                                    style={theme === 'light' ? { backgroundColor: 'var(--highlight-color)', color: 'var(--foundation-color)', border: 'none' } : undefined}
                                >
                                    Light
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? undefined : 'outline-secondary'}
                                    onClick={() => setTheme('dark')}
                                    style={theme === 'dark' ? { backgroundColor: 'var(--highlight-color)', color: 'var(--foundation-color)', border: 'none' } : undefined}
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
