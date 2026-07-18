import { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/animals', label: 'Animals' },
  { to: '/plants', label: 'Plants' },
  { to: '/waters', label: 'Waters' },
  { to: '/about', label: 'About' },
  { to: '/dashboard', label: 'Dashboard' },
];

const AppNavbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Only the home route has a full-bleed hero for the nav to float over.
  // Everywhere else the nav is solid from the top so links stay legible.
  const overHero = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || !overHero;

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`site-nav ${solid ? 'site-nav--solid' : ''}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="site-nav__brand">
          WORLD<span>SPHERE</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" className="site-nav__toggle" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center">
            {LINKS.map(link => (
              <Nav.Link
                key={link.to}
                as={Link}
                to={link.to}
                className={`site-nav__link ${pathname === link.to ? 'is-active' : ''}`}
              >
                {link.label}
              </Nav.Link>
            ))}

            <div className="px-lg-2 py-2 py-lg-0">
              <SearchBar />
            </div>

            {isAuthenticated ? (
              <Nav.Link as={Link} to="/profile" className="site-nav__link site-nav__link--accent">
                {user?.name ?? 'Profile'}
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="site-nav__link">Log In</Nav.Link>
                <Link to="/signup" className="btn btn-solar btn-sm ms-lg-2">Sign Up</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
