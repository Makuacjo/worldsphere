import { useEffect, useState, type FormEvent } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Touched {
    email?: boolean;
    password?: boolean;
}

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Touched>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    // Already signed in — send them straight to their profile.
    useEffect(() => {
        if (isAuthenticated) navigate('/profile', { replace: true });
    }, [isAuthenticated, navigate]);

    const errors: Record<keyof Touched, string | undefined> = {
        email: !email.trim() ? 'Email is required.' : !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : undefined,
        password: !password ? 'Password is required.' : undefined,
    };
    const isValid = Object.values(errors).every(error => !error);

    const markTouched = (field: keyof Touched) => setTouched(prev => ({ ...prev, [field]: true }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        setServerError('');
        if (!isValid) return;

        setSubmitting(true);
        try {
            await login(email.trim(), password);
            const requested = (location.state as { from?: string } | null)?.from || sessionStorage.getItem('worldsphere_auth_return');
            sessionStorage.removeItem('worldsphere_auth_return');
            navigate(requested || '/profile', { replace: true });
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Could not sign in.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="page-shell">
            <Container>
                <Row className="justify-content-center">
                    <Col md={7} lg={5}>
                        <div className="panel p-4 p-md-5">
                            <p className="kicker mb-2">Welcome Back</p>
                            <h2 className="auth-title">Log In</h2>

                            <Form onSubmit={handleSubmit} noValidate>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => markTouched('email')}
                                        placeholder="jane@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        isInvalid={!!touched.email && !!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Password</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => markTouched('password')}
                                            autoComplete="current-password"
                                            isInvalid={!!touched.password && !!errors.password}
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(prev => !prev)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </Button>
                                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>

                                {serverError && (
                                    <p className="small mb-3" style={{ color: 'var(--error-color)' }}>{serverError}</p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-solar w-100 justify-content-center"
                                >
                                    {submitting && <Spinner animation="border" size="sm" />}
                                    {submitting ? 'Logging In…' : 'Log In'}
                                </Button>
                            </Form>

                            <p className="text-center mt-4 mb-0 small" style={{ color: 'var(--secondary-color)' }}>
                                Don't have an account? <Link to="/signup" style={{ color: 'var(--highlight-color)' }}>Sign up</Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Login;
