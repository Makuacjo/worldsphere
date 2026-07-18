import { Container } from 'react-bootstrap';
import RiskPredictorPanel from '../components/RiskPredictorPanel';

const RiskPredictor = () => (
  <section className="page-shell">
    <Container>
      <div className="page-head">
        <p className="kicker">Conservation Insights</p>
        <h1 className="page-head__title">Risk Predictor</h1>
        <p className="page-head__lede">
          Estimate a conservation risk category from a species' key traits, using a model trained via the ml-service.
        </p>
      </div>
      <RiskPredictorPanel />
    </Container>
  </section>
);

export default RiskPredictor;
