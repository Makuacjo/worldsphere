import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Spinner } from 'react-bootstrap';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ComingSoon from './pages/ComingSoon';

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
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RiskPredictor = lazy(() => import('./pages/RiskPredictor'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
    <Spinner animation="border" style={{ color: 'var(--highlight-color)' }} />
  </div>
);

// Shared shell: persistent Navbar/Footer with the routed page in between.
// A data router (createBrowserRouter) is required for View Transitions —
// Link viewTransition / useViewTransitionState only work under it.
const Layout = () => (
  <>
    <Navbar />
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
    <Footer />
  </>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      // New IA surfaces (real pages land in later phases; on-brand shells for now)
      {
        path: 'explore',
        element: <ComingSoon title="Explore" note="Arriving with the interactive globe"
          blurb="An immersive way to roam the planet — the interactive Earth, continents, and the living things that define each region." />,
      },
      { path: 'stories', element: <Stories /> },
      { path: 'maps', element: <Maps /> },
      { path: 'research', element: <Dashboard /> },
      { path: 'communities', element: <Communities /> },
      { path: 'expeditions', element: <Expeditions /> },
      { path: 'ai', element: <AIExplorer /> },

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
