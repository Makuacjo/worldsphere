import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, Compass, BookOpen, Map, FlaskConical, Users, Sparkles,
  User, Search, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type NavItem = { to: string; label: string; Icon: typeof Compass; cursor?: string };
const NAV_ITEMS: NavItem[] = [
  { to: '/explore', label: 'Explore', Icon: Compass, cursor: 'globe' },
  { to: '/stories', label: 'Stories', Icon: BookOpen },
  { to: '/maps', label: 'Maps', Icon: Map, cursor: 'compass' },
  { to: '/research', label: 'Research', Icon: FlaskConical },
  { to: '/communities', label: 'Communities', Icon: Users },
  { to: '/ai', label: 'AI', Icon: Sparkles, cursor: 'brain' },
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
            <Globe size={20} strokeWidth={1.75} />
            <span>WORLDSPHERE</span>
          </Link>

          <ul className="fnav__list">
            {NAV_ITEMS.map(({ to, label, Icon, cursor }) => (
              <li key={to}>
                <Link to={to} data-cursor={cursor} className={`fnav__item ${isActive(to) ? 'is-active' : ''}`}>
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

      {/* Mobile bottom dock */}
      <nav className="fdock" aria-label="Primary mobile">
        <Link to="/explore" data-cursor="globe" className={`fdock__item ${isActive('/explore') ? 'is-active' : ''}`}>
          <Compass size={22} strokeWidth={1.75} /><span>Explore</span>
        </Link>
        <Link to="/stories" className={`fdock__item ${isActive('/stories') ? 'is-active' : ''}`}>
          <BookOpen size={22} strokeWidth={1.75} /><span>Stories</span>
        </Link>
        <Link to="/maps" data-cursor="compass" className={`fdock__item ${isActive('/maps') ? 'is-active' : ''}`}>
          <Map size={22} strokeWidth={1.75} /><span>Maps</span>
        </Link>
        <Link to="/ai" data-cursor="brain" className={`fdock__item ${isActive('/ai') ? 'is-active' : ''}`}>
          <Sparkles size={22} strokeWidth={1.75} /><span>AI</span>
        </Link>
        <Link to={isAuthenticated ? '/profile' : '/login'} className={`fdock__item ${isActive('/profile') ? 'is-active' : ''}`}>
          <User size={22} strokeWidth={1.75} /><span>You</span>
        </Link>
      </nav>
    </>
  );
};

export default FloatingNav;
