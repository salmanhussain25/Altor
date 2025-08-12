
import { debug } from '../utils/debug';

const DB_NAME = 'AltorOfflineDB';
const DB_VERSION = 1;

interface StoreConfig {
  name: string;
  options?: IDBObjectStoreParameters;
}

// Define object stores. Using keyPath 'id' for inline keys.
const STORES: StoreConfig[] = [
  { name: 'lessons', options: { keyPath: 'id' } },
  { name: 'solutions', options: { keyPath: 'id' } },
  { name: 'libraryCourses', options: { keyPath: 'id' } },
  { name: 'visualAids', options: { keyPath: 'id' } },
];

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('Error opening IndexedDB');
      dbPromise = null;
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      STORES.forEach(storeConfig => {
        if (!dbInstance.objectStoreNames.contains(storeConfig.name)) {
          dbInstance.createObjectStore(storeConfig.name, storeConfig.options);
          debug('DB', `Object store created: ${storeConfig.name}`);
        }
      });
    };
  });
  return dbPromise;
};

export const dbService = {
  get: async <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result as T);
            };

            request.onerror = (event) => {
                console.error('IndexedDB get error:', (event.target as IDBRequest).error);
                reject(`Error getting data from ${storeName}`);
            };
        });
    } catch (error) {
        console.error('Failed to get from IndexedDB', { storeName, key, error });
        return undefined; // Fail gracefully if DB is unavailable
    }
  },
  
  set: async (storeName: string, value: object & { id: IDBValidKey }): Promise<void> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('IndexedDB set error:', (event.target as IDBRequest).error);
                reject(`Error setting data in ${storeName}`);
            };
        });
    } catch (error) {
        console.error('Failed to set to IndexedDB', { storeName, value, error });
        // Fail gracefully
    }
  },
};
