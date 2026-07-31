import { API_BASE_URL } from './apiConfig';

const TOKEN_KEY = 'worldsphere_token';
export const authToken = () => localStorage.getItem(TOKEN_KEY);

export class AccountApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authToken();
  if (!token) throw new AccountApiError('Sign in to continue.');
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers ?? {}) },
    });
  } catch {
    throw new AccountApiError('Could not reach your WorldSphere account.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new AccountApiError(body?.detail ?? `Request failed (${response.status}).`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export interface SavedTrip {
  id: number; title: string; resourceType?: string | null; resourceId?: string | null;
  destination?: string | null; startDate?: string | null; endDate?: string | null;
  travelers: number; notes: string; itinerary: Record<string, unknown>;
  createdAt: string; updatedAt: string;
}
export type SavedTripInput = Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>;
export interface TripPlanSummary { id: number; title: string; destination: string; conversationId?: string | null; updatedAt: string; }
export interface TripPlan extends TripPlanSummary { savedTripId?: number | null; inputs: Record<string, unknown>; planText: string; createdAt: string; }
export interface Expense { id?: number; category: string; label: string; amountMinor: number; }
export interface BudgetPlan {
  id: number; savedTripId?: number | null; title: string; currency: string; targetMinor: number;
  travelers: number; durationDays: number; expenses: Expense[]; totalMinor: number;
  remainingMinor: number; perTravelerMinor: number; perDayMinor: number; createdAt: string; updatedAt: string;
}
export type BudgetInput = Pick<BudgetPlan, 'title' | 'currency' | 'targetMinor' | 'travelers' | 'durationDays' | 'expenses'> & { savedTripId?: number | null };
export interface Activity { id: number; eventType: string; resourceType?: string; resourceId?: string; label: string; createdAt: string; metadata?: Record<string, unknown>; }
export interface DashboardConversation { id: string; assistantType: 'SPECIES' | 'TOUR_GUIDE'; title: string | null; preview: string; createdAt: string; updatedAt: string; }
export interface DashboardData { trips: SavedTrip[]; plans: TripPlanSummary[]; budgets: BudgetPlan[]; favorites: Array<{id:number;key:string;source:string;name:string;image?:string|null}>; activity: Activity[]; conversations: DashboardConversation[]; }

export const getDashboard = () => request<DashboardData>('/account/dashboard');
export const listTrips = () => request<SavedTrip[]>('/account/trips');
export const createTrip = (input: Partial<SavedTripInput> & {title:string}) => request<SavedTrip>('/account/trips', { method: 'POST', body: JSON.stringify(input) });
export const updateTrip = (id: number, input: Partial<SavedTripInput>) => request<SavedTrip>(`/account/trips/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteTrip = (id: number) => request<void>(`/account/trips/${id}`, { method: 'DELETE' });
export const duplicateTrip = (id: number) => request<SavedTrip>(`/account/trips/${id}/duplicate`, { method: 'POST' });
export const listBudgets = () => request<BudgetPlan[]>('/account/budgets');
export const createBudget = (input: BudgetInput) => request<BudgetPlan>('/account/budgets', { method: 'POST', body: JSON.stringify(input) });
export const updateBudget = (id: number, input: BudgetInput) => request<BudgetPlan>(`/account/budgets/${id}`, { method: 'PUT', body: JSON.stringify(input) });
export const deleteBudget = (id: number) => request<void>(`/account/budgets/${id}`, { method: 'DELETE' });
export const duplicateBudget = (id: number) => request<BudgetPlan>(`/account/budgets/${id}/duplicate`, { method: 'POST' });
export const createTripPlan = (input: {title:string;destination:string;savedTripId?:number;conversationId?:string;inputs:Record<string,unknown>;planText:string}) => request('/account/plans', {method:'POST',body:JSON.stringify(input)});
export const getTripPlan = (id:number) => request<TripPlan>(`/account/plans/${id}`);
export const updateTripPlan = (id:number,input:Partial<Pick<TripPlan,'title'|'destination'|'savedTripId'|'conversationId'|'inputs'|'planText'>>) => request<TripPlan>(`/account/plans/${id}`,{method:'PATCH',body:JSON.stringify(input)});
export const deleteTripPlan = (id:number) => request<void>(`/account/plans/${id}`,{method:'DELETE'});
export const recordActivity = (input: {eventType:'destination_viewed'|'attraction_viewed';resourceType:string;resourceId:string;label:string}) => request<void>('/account/activity',{method:'POST',body:JSON.stringify(input)});
export const recordSearch = (query:string,scope='site') => request<void>('/account/searches',{method:'POST',body:JSON.stringify({query,scope})});

export const calculateBudget = (input: Pick<BudgetInput, 'targetMinor'|'travelers'|'durationDays'|'expenses'>) => {
  const totalMinor = input.expenses.reduce((sum, item) => sum + Math.max(0, Math.trunc(item.amountMinor)), 0);
  const travelers = Math.max(1, Math.trunc(input.travelers));
  const durationDays = Math.max(1, Math.trunc(input.durationDays));
  return { totalMinor, remainingMinor: Math.trunc(input.targetMinor) - totalMinor,
    perTravelerMinor: Math.trunc(totalMinor / travelers), perDayMinor: Math.trunc(totalMinor / durationDays) };
};