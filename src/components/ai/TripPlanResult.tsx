import type { ReactNode } from 'react';

const TripPlanResult = ({ children }: { children: ReactNode }) => (
  <div className="trip-plan-result">{children}<p className="trip-plan-result__note">All costs and availability are approximate until verified with a current provider.</p></div>
);

export default TripPlanResult;
