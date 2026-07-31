import type { AssistantType } from '../../services/assistantApi';

export interface AssistantPresentation {
  type: AssistantType;
  name: string;
  shortName: string;
  description: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  suggestedQuestions: string[];
  accent: string;
}

export const assistantPresentations: Record<AssistantType, AssistantPresentation> = {
  SPECIES: {
    type: 'SPECIES',
    name: 'WorldSphere Species AI',
    shortName: 'Species AI',
    description: 'Discover wildlife, plants, habitats, and conservation.',
    welcomeMessage: 'Ask about any species, habitat, or conservation question.',
    inputPlaceholder: 'Ask the planet anything about wildlife or habitats',
    suggestedQuestions: [
      'Why are amphibians declining worldwide?',
      'What makes a keystone species?',
      'Where can I see elephants in Kenya?',
      'Which birds are found around Lake Nakuru?',
    ],
    accent: '#2EBDC4',
  },
  TOUR_GUIDE: {
    type: 'TOUR_GUIDE',
    name: 'WorldSphere Kenya Tour Guide AI',
    shortName: 'Kenya Tour Guide AI',
    description: 'Plan trips, estimate budgets, discover destinations, and build itineraries.',
    welcomeMessage: 'Tell me how you like to travel, and I will shape a Kenya journey around you.',
    inputPlaceholder: 'Ask about a Kenya trip, destination, budget, or itinerary',
    suggestedQuestions: [
      'Plan a five-day trip to Kenya.',
      'Compare Maasai Mara and Amboseli.',
      'How much should I budget for a Diani holiday?',
      'Create a safari and beach itinerary.',
    ],
    accent: '#F85959',
  },
};
