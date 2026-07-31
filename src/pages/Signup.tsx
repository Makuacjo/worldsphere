import { useEffect, useState, type FormEvent } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Touched {
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
}

const getPasswordStrength = (password: string): { label: string; ratio: number; color: string } => {
    if (password.length === 0) return { label: '', ratio: 0, color: 'var(--secondary-color)' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: 'Weak', ratio: 1 / 3, color: 'var(--error-color)' };
    if (score <= 3) return { label: 'Fair', ratio: 2 / 3, color: 'var(--highlight-color)' };
    return { label: 'Strong', ratio: 1, color: 'var(--secondary-color)' };
};

const Signup = () => {
    const { signup, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Touched>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    // Already signed in — the signup form has nothing left to offer them.
    useEffect(() => {
        if (isAuthenticated) navigate('/profile', { replace: true });
    }, [isAuthenticated, navigate]);

    const errors: Record<keyof Touched, string | undefined> = {
        name: !name.trim() ? 'Name is required.' : undefined,
        email: !email.trim() ? 'Email is required.' : !EMAIL_PATTERN.test(email) ? 'Enter a valid email address.' : undefined,
        password: !password ? 'Password is required.' : password.length < 8 ? 'Use at least 8 characters.' : undefined,
        confirmPassword: !confirmPassword ? 'Please confirm your password.' : confirmPassword !== password ? 'Passwords do not match.' : undefined,
    };
    const isValid = Object.values(errors).every(error => !error);
    const strength = getPasswordStrength(password);

    const markTouched = (field: keyof Touched) => setTouched(prev => ({ ...prev, [field]: true }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true, confirmPassword: true });
        setServerError('');
        if (!isValid) return;

        setSubmitting(true);
        try {
            await signup(name.trim(), email.trim(), password);
            const requested = (location.state as { from?: string } | null)?.from || sessionStorage.getItem('worldsphere_auth_return');
            sessionStorage.removeItem('worldsphere_auth_return');
            navigate(requested || '/profile', { replace: true });
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Could not create your account.');
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
                            <p className="kicker mb-2">Join WorldSphere</p>
                            <h2 className="auth-title">Create an Account</h2>

                            <Form onSubmit={handleSubmit} noValidate>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => markTouched('name')}
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        autoFocus
                                        isInvalid={!!touched.name && !!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => markTouched('email')}
                                        placeholder="jane@example.com"
                                        autoComplete="email"
                                        isInvalid={!!touched.email && !!errors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Password</Form.Label>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => markTouched('password')}
                                            placeholder="At least 8 characters"
                                            autoComplete="new-password"
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
                                    {password.length > 0 && (
                                        <div className="mt-2">
                                            <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'var(--surface-alt-color)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${strength.ratio * 100}%`, backgroundColor: strength.color, transition: 'width 0.2s ease' }} />
                                            </div>
                                            <span className="small" style={{ color: strength.color }}>{strength.label}</span>
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4 mt-3">
                                    <Form.Label style={{ color: 'var(--text-color)' }}>Confirm Password</Form.Label>
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={() => markTouched('confirmPassword')}
                                        autoComplete="new-password"
                                        isInvalid={!!touched.confirmPassword && !!errors.confirmPassword}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
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
                                    {submitting ? 'Creating Account…' : 'Sign Up'}
                                </Button>
                            </Form>

                            <p className="text-center mt-4 mb-0 small" style={{ color: 'var(--secondary-color)' }}>
                                Already have an account? <Link to="/login" style={{ color: 'var(--highlight-color)' }}>Log in</Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Signup;
