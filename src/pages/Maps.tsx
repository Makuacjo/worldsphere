import { lazy, Suspense } from 'react';

// three.js is heavy — only load it when someone actually opens Maps.
const InteractiveGlobe = lazy(() => import('../components/InteractiveGlobe'));

const Maps = () => (
  <section className="maps">
    <div className="maps__overlay">
      <p className="kicker">Maps</p>
      <h1 className="maps__title">Spin the living Earth</h1>
      <p className="maps__lede">
        Drag to rotate, scroll to zoom. Tap a glowing region to explore the
        species that call it home.
      </p>
    </div>

    <Suspense fallback={<div className="globe__fallback" aria-hidden="true" />}>
      <InteractiveGlobe />
    </Suspense>
  </section>
);

export default Maps;
