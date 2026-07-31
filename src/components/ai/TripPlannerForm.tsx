import { useState, type FormEvent } from 'react';
import { CalendarDays, ChevronDown, MapPin, Users } from 'lucide-react';

export interface TripPlannerValues {
  departureLocation: string;
  startingCity: string;
  startDate: string;
  days: number;
  adults: number;
  children: number;
  budget: string;
  currency: string;
  travelStyle: string;
  accommodationLevel: string;
  transportPreference: string;
  destinations: string;
  interests: string[];
  activityLevel: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  specialRequirements: string;
}

interface Props {
  onPlan: (prompt: string, values: TripPlannerValues) => void;
  disabled?: boolean;
}

const INTERESTS = ['Wildlife', 'Beaches', 'Adventure', 'Culture', 'History', 'Food', 'Photography', 'Nature', 'Nightlife', 'Family activities', 'Relaxation'];

const TripPlannerForm = ({ onPlan, disabled }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<TripPlannerValues>({
    departureLocation: '', startingCity: 'Nairobi', startDate: '', days: 7,
    adults: 2, children: 0, budget: '', currency: 'KES', travelStyle: 'Standard',
    accommodationLevel: 'Mid-range', transportPreference: 'Mixed',
    destinations: '', interests: ['Wildlife', 'Culture'], activityLevel: 'Moderate',
    dietaryNeeds: '', accessibilityNeeds: '', specialRequirements: '',
  });
  const set = <K extends keyof TripPlannerValues>(key: K, value: TripPlannerValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const toggleInterest = (interest: string) => set('interests', values.interests.includes(interest) ? values.interests.filter((item) => item !== interest) : [...values.interests, interest]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const prompt = `Build a ${values.days}-day ${values.travelStyle.toLowerCase()} Kenya itinerary for ${values.adults} adult(s) and ${values.children} child(ren), starting in ${values.startingCity}. Interests: ${values.interests.join(', ')}. Budget: ${values.budget || 'please estimate'} ${values.currency}. Include a complete approximate cost breakdown, transport, stays, packing, weather and safety.`;
    onPlan(prompt, values);
  };
  return (
    <form className="trip-form" onSubmit={submit}>
      <button type="button" className="trip-form__toggle" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span><CalendarDays size={18} /> Structured trip planner</span><ChevronDown size={18} className={expanded ? 'is-open' : ''} />
      </button>
      {expanded && <div className="trip-form__body">
        <div className="trip-form__grid">
          <label><span>Departure location</span><input value={values.departureLocation} onChange={(e) => set('departureLocation', e.target.value)} placeholder="e.g. London" /></label>
          <label><span>Start in Kenya</span><div className="trip-field-icon"><MapPin size={15} /><input value={values.startingCity} onChange={(e) => set('startingCity', e.target.value)} /></div></label>
          <label><span>Start date</span><input type="date" value={values.startDate} onChange={(e) => set('startDate', e.target.value)} /></label>
          <label><span>Days</span><input type="number" min="1" max="60" value={values.days} onChange={(e) => set('days', Number(e.target.value))} /></label>
          <label><span>Adults</span><input type="number" min="1" max="20" value={values.adults} onChange={(e) => set('adults', Number(e.target.value))} /></label>
          <label><span>Children</span><input type="number" min="0" max="20" value={values.children} onChange={(e) => set('children', Number(e.target.value))} /></label>
          <label><span>Total budget</span><input value={values.budget} onChange={(e) => set('budget', e.target.value)} placeholder="e.g. 250000" /></label>
          <label><span>Currency</span><select value={values.currency} onChange={(e) => set('currency', e.target.value)}><option>KES</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>
          <label><span>Travel style</span><select value={values.travelStyle} onChange={(e) => set('travelStyle', e.target.value)}><option>Budget</option><option>Standard</option><option>Luxury</option></select></label>
          <label><span>Accommodation</span><select value={values.accommodationLevel} onChange={(e) => set('accommodationLevel', e.target.value)}><option>Budget</option><option>Mid-range</option><option>Luxury</option><option>Camping</option><option>Eco lodge</option></select></label>
          <label><span>Transport</span><select value={values.transportPreference} onChange={(e) => set('transportPreference', e.target.value)}><option>Mixed</option><option>Private driver</option><option>Domestic flights</option><option>Public transport</option><option>Self-drive</option></select></label>
          <label><span>Activity level</span><select value={values.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}><option>Relaxed</option><option>Moderate</option><option>Active</option></select></label>
        </div>
        <label><span>Preferred destinations</span><input value={values.destinations} onChange={(e) => set('destinations', e.target.value)} placeholder="Maasai Mara, Diani, Lamu…" /></label>
        <fieldset><legend>Interests</legend><div className="trip-interests">{INTERESTS.map((interest) => <button type="button" className={values.interests.includes(interest) ? 'is-active' : ''} key={interest} onClick={() => toggleInterest(interest)}>{interest}</button>)}</div></fieldset>
        <div className="trip-form__grid">
          <label><span>Dietary needs</span><input value={values.dietaryNeeds} onChange={(e) => set('dietaryNeeds', e.target.value)} /></label>
          <label><span>Accessibility needs</span><input value={values.accessibilityNeeds} onChange={(e) => set('accessibilityNeeds', e.target.value)} /></label>
        </div>
        <label><span>Special requirements</span><textarea value={values.specialRequirements} onChange={(e) => set('specialRequirements', e.target.value)} rows={2} /></label>
        <button className="trip-form__submit" disabled={disabled}><Users size={17} /> Build my Kenya plan</button>
      </div>}
    </form>
  );
};

export default TripPlannerForm;
