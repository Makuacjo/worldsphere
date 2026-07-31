import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import './RouteError.css';

const RouteError = () => {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error interrupted this page.';

  return (
    <main className="route-error">
      <div className="route-error__panel">
        <span className="route-error__icon"><AlertTriangle size={28} /></span>
        <p className="kicker">WorldSphere recovery</p>
        <h1>This page lost its trail.</h1>
        <p className="route-error__message">{message}</p>
        <div className="route-error__actions">
          <button type="button" className="btn btn-solar" onClick={() => window.location.reload()}>
            <RefreshCw size={17} /> Try again
          </button>
          <Link to="/" className="btn route-error__home"><Home size={17} /> Return home</Link>
        </div>
      </div>
    </main>
  );
};

export default RouteError;
