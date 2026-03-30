import Dexie, { Table } from 'dexie';

export interface SyncOperation {
  id?: number;
  tipo: 'DOSIS';
  payload: any;
  fecha: number;
}

export class ClinicalDB extends Dexie {
  syncQueue!: Table<SyncOperation, number>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      syncQueue: '++id, tipo, fecha'
    });
  }
}

export const db = new ClinicalDB('ClinicalOfflineDB');
