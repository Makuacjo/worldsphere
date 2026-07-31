import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, BookOpen, Map, FlaskConical, Users, Sparkles,
  User, Search, Sun, Moon, Plane, Menu, X, Globe2,
} from 'lucide-react';
import { useAuth } from '../context/auth';
import { useTheme } from '../context/theme';

type NavItem = { to: string; label: string; Icon: typeof Compass };
const NAV_ITEMS: NavItem[] = [
  { to: '/explore', label: 'Explore', Icon: Compass },
  { to: '/tourism', label: 'Tourism', Icon: Plane },
  { to: '/stories', label: 'Stories', Icon: BookOpen },
  { to: '/maps', label: 'Maps', Icon: Map },
  { to: '/research', label: 'Research', Icon: FlaskConical },
  { to: '/communities', label: 'Communities', Icon: Users },
  { to: '/ai', label: 'AI', Icon: Sparkles },
];

/**
 * Floating glass navigation.
 * Desktop: a translucent, blurred pill that auto-hides on scroll-down and
 * returns on scroll-up. Mobile: a bottom floating dock of icons.
 */
const FloatingNav = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 24);
      // Hide when scrolling down past the hero; reveal on any upward scroll.
      if (y > lastY.current && y > 120) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');

  return (
    <>
      {/* Desktop pill */}
      <header className={`fnav ${hidden ? 'is-hidden' : ''} ${atTop ? 'is-top' : ''}`}>
        <nav className="fnav__pill" aria-label="Primary">
          <Link to="/" className="fnav__brand">
            <Globe2 className="fnav__brand-mark" size={20} strokeWidth={1.8} aria-hidden="true" />
            <span>WORLDSPHERE</span>
          </Link>

          <ul className="fnav__list">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <li key={to}>
                <Link to={to} className={`fnav__item ${isActive(to) ? 'is-active' : ''}`}>
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="fnav__actions">
            <button
              type="button"
              className="fnav__icon-btn"
              aria-label="Search"
              onClick={() => navigate('/search')}
            >
              <Search size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="fnav__icon-btn"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
            </button>
            <Link to={isAuthenticated ? '/profile' : '/login'} className="fnav__profile">
              <User size={16} strokeWidth={1.75} />
              <span>{isAuthenticated ? (user?.name?.split(' ')[0] ?? 'Profile') : 'Sign In'}</span>
            </Link>
          </div>
        </nav>
      </header>

      {mobileMoreOpen && (
        <nav id="mobile-more-navigation" className="fdock-more" aria-label="More mobile navigation">
          <Link to="/stories" className={isActive('/stories') ? 'is-active' : ''} onClick={() => setMobileMoreOpen(false)}><BookOpen size={20} aria-hidden="true" /><span>Stories</span></Link>
          <Link to="/research" className={isActive('/research') ? 'is-active' : ''} onClick={() => setMobileMoreOpen(false)}><FlaskConical size={20} aria-hidden="true" /><span>Research</span></Link>
          <Link to={isAuthenticated ? '/profile' : '/login'} className={isActive('/profile') || isActive('/login') ? 'is-active' : ''} onClick={() => setMobileMoreOpen(false)}><User size={20} aria-hidden="true" /><span>Profile</span></Link>
        </nav>
      )}

      {/* Mobile bottom dock: four primary destinations and progressive disclosure. */}
      <nav className="fdock" aria-label="Primary mobile">
        {NAV_ITEMS.filter(({ to }) => ['/explore', '/tourism', '/maps', '/ai'].includes(to)).map(({ to, label, Icon }) => (
          <Link key={to} to={to} className={`fdock__item ${isActive(to) ? 'is-active' : ''}`}>
            <Icon size={21} strokeWidth={1.75} aria-hidden="true" /><span>{label}</span>
          </Link>
        ))}
        <button type="button" className={`fdock__item ${mobileMoreOpen ? 'is-active' : ''}`} aria-expanded={mobileMoreOpen} aria-controls="mobile-more-navigation" onClick={() => setMobileMoreOpen(open => !open)}>
          {mobileMoreOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          <span>More</span>
        </button>
      </nav>
    </>
  );
};

export default FloatingNav;
