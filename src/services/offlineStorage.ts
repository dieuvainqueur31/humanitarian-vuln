import type { ObservationPayload } from '../types/fieldAgent';
import { apiFetch } from './api';

export interface CachedObservation {
  id: string;
  missionUuid: string;
  payload: ObservationPayload;
  timestamp: string;
}

const OFFLINE_QUEUE_KEY = 'pending_field_observations';

export const getPendingObservations = (): CachedObservation[] => {
  const cached = localStorage.getItem(OFFLINE_QUEUE_KEY);
  return cached ? JSON.parse(cached) : [];
};

export const saveObservationOffline = (missionUuid: string, payload: ObservationPayload): CachedObservation => {
  const pending = getPendingObservations();
  const newItem: CachedObservation = {
    id: `local-${Date.now()}`,
    missionUuid,
    payload,
    timestamp: new Date().toISOString(),
  };
  pending.push(newItem);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pending));
  return newItem;
};

export const removePendingObservation = (id: string) => {
  const pending = getPendingObservations().filter((item) => item.id !== id);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pending));
};

export const syncPendingObservations = async (): Promise<number> => {
  const pending = getPendingObservations();
  if (pending.length === 0) return 0;

  let syncedCount = 0;
  for (const item of pending) {
    try {
      await apiFetch(`/missions/${item.missionUuid}/observations`, {
        method: 'POST',
        body: JSON.stringify(item.payload),
      });
      removePendingObservation(item.id);
      syncedCount++;
    } catch (err) {
      console.error(`Failed to sync item ${item.id}`, err);
    }
  }
  return syncedCount;
};