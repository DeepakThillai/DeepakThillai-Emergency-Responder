import { Responder, Alert } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Helper ───────────────────────────────────────────────────────────────────

function parseResponder(raw: Record<string, unknown>): Responder {
  // The backend sends dates as ISO strings — convert them back to Date objects
  // so all existing components that call .getTime(), .toLocaleTimeString() etc. keep working.
  return {
    ...(raw as unknown as Responder),
    deploymentTime: new Date(raw.deploymentTime as string),
    device: {
      ...(raw.device as Record<string, unknown>),
      lastSync: new Date((raw.device as Record<string, unknown>).lastSync as string),
    } as Responder['device'],
    vitalHistory: ((raw.vitalHistory as Array<Record<string, unknown>>) || []).map((h) => ({
      timestamp: new Date(h.timestamp as string),
      vitals: h.vitals as Responder['vitals'],
    })),
    gasHistory: ((raw.gasHistory as Array<Record<string, unknown>>) || []).map((h) => ({
      timestamp: new Date(h.timestamp as string),
      gas: h.gas as Responder['gasExposure'],
    })),
  };
}

function parseAlert(raw: Record<string, unknown>): Alert {
  return {
    ...(raw as unknown as Alert),
    timestamp: new Date(raw.timestamp as string),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchResponders(): Promise<Responder[]> {
  const res = await fetch(`${API_BASE}/responders`);
  if (!res.ok) throw new Error(`fetchResponders failed: ${res.status}`);
  const data: Record<string, unknown>[] = await res.json();
  return data.map(parseResponder);
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error(`fetchAlerts failed: ${res.status}`);
  const data: Record<string, unknown>[] = await res.json();
  return data.map(parseAlert);
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error(`acknowledgeAlert failed: ${res.status}`);
}

export async function dismissAlert(alertId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`dismissAlert failed: ${res.status}`);
}
