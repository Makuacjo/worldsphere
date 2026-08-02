import { lazy, Suspense, useLayoutEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Spinner } from 'react-bootstrap';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastCenter from './components/ToastCenter';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import './index.css'

// Route-level code splitting — each page ships in its own chunk, so heavy
// deps (recharts on Dashboard/RiskPredictor, ogl on Home) stay out of the
// initial load.
const Home = lazy(() => import('./pages/Home'));
const Animals = lazy(() => import('./pages/Animals'));
const Plants = lazy(() => import('./pages/Plants'));
const Waters = lazy(() => import('./pages/Waters'));
const About = lazy(() => import('./pages/About'));
const SpeciesDetail = lazy(() => import('./pages/SpeciesDetails'));
const Search = lazy(() => import('./pages/Search'));
const Maps = lazy(() => import('./pages/Maps'));
const Stories = lazy(() => import('./pages/Stories'));
const AIExplorer = lazy(() => import('./pages/AIExplorer'));
const Communities = lazy(() => import('./pages/Communities'));
const Expeditions = lazy(() => import('./pages/Expeditions'));
const GbifExplore = lazy(() => import('./pages/GbifExplore'));
const GbifSpecies = lazy(() => import('./pages/GbifSpecies'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RiskPredictor = lazy(() => import('./pages/RiskPredictor'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/AccountDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Tourism = lazy(() => import('./pages/Tourism'));
const TourismGuide = lazy(() => import('./pages/TourismGuide'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const NairobiAttractionDetail = lazy(() => import('./pages/NairobiAttractionDetail'));
const SpeciesAI = lazy(() => import('./pages/SpeciesAI'));
const TourGuideAI = lazy(() => import('./pages/TourGuideAI'));
const RouteError = lazy(() => import('./pages/RouteError'));

const PageFallback = () => (
  <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
    <Spinner animation="border" style={{ color: 'var(--highlight-color)' }} />
  </div>
);

const RouteScrollManager = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({
          block: 'start',
        });
      });

      return () => {
        window.cancelAnimationFrame(frame);
        window.history.scrollRestoration = previousRestoration;
      };
    }

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname, hash]);

  return null;
};
// Shared shell: persistent Navbar/Footer with the routed page in between.
// A data router (createBrowserRouter) is required for View Transitions —
// Link viewTransition / useViewTransitionState only work under it.
const Layout = () => (
  <>
    <RouteScrollManager />
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Navbar />
    <div id="main-content">
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </div>
    <Footer />
    <ToastCenter />
  </>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },

      // Explore == real biodiversity search over GBIF
      { path: 'explore', element: <GbifExplore /> },
      { path: 'explore/:key', element: <GbifSpecies /> },
      { path: 'stories', element: <Stories /> },
      { path: 'maps', element: <Maps /> },
      { path: 'research', element: <Dashboard /> },
      { path: 'communities', element: <Communities /> },
      { path: 'expeditions', element: <Expeditions /> },
      { path: 'ai', element: <AIExplorer /> },
      { path: 'ai/species', element: <SpeciesAI /> },
      { path: 'ai/tour-guide', element: <TourGuideAI /> },
      { path: 'tourism', element: <Tourism /> },
      { path: 'tourism/guides/:slug', element: <TourismGuide /> },
      { path: 'destinations/:slug', element: <DestinationDetail /> },
      { path: 'destinations/:destinationSlug/attractions/:attractionSlug', element: <NairobiAttractionDetail /> },

      // Category pages (kept; reframed as Stories in a later phase)
      { path: 'animals', element: <Animals /> },
      { path: 'plants', element: <Plants /> },
      { path: 'waters', element: <Waters /> },
      { path: 'about', element: <About /> },
      { path: 'search', element: <Search /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'risk-predictor', element: <RiskPredictor /> },

      // Auth & Profile
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'profile', element: <Profile /> },

      // Dynamic detail page
      { path: 'species/:id', element: <SpeciesDetail /> },

      // Fallback for unmatched routes
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* reducedMotion="user" makes every framer animation honor the OS setting */}
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
