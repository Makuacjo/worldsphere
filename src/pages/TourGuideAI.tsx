import { useSearchParams } from 'react-router-dom';
import WorldSphereAssistant from '../components/ai/WorldSphereAssistant';

const TourGuideAI = () => {
  const [params] = useSearchParams();
  return <WorldSphereAssistant assistantType="TOUR_GUIDE" initialPrompt={params.get('prompt') ?? ''} />;
};

export default TourGuideAI;
