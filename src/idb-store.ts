import { type DBSchema, openDB } from "idb";
import { type PiniaPluginContext, defineStore } from "pinia";

export interface Band {
  id: number;
  nickname: string;
  macAddress: string;
  device: BluetoothDevice;
  authKey: string;
  dateAdded: Date;
};

interface MiBandDB extends DBSchema {
  config: {
    key: "showBetaBanner";
    value: boolean
  };
  bands: {
    key: number;
    value: Band;
  };
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    showBetaBanner: boolean;
    bands: Band[];
  }
}

async function getDb() {
  return await openDB<MiBandDB>("miband4-web-db", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) // if we're upgrading from a version below 1
        db.createObjectStore("config");
      db.createObjectStore("bands");
    }
  });
}

export const useConfigStore = defineStore("config", {
  state: () => ({
    showBetaBanner: false  
  }),
  actions: {
    stopShowingBetaBanner() {
      this.showBetaBanner = false;
    }
  }
});

export const useBandsStore = defineStore("bands", {
  state: () => ({ 
    bands: []
  } as { bands: Band[] }),
  actions: {
    getReversedBands(): Band[] {
      return [...this.bands].reverse();
    }
  }
});

export async function indexedDbPlugin({ store }: PiniaPluginContext) {
  const db = await getDb();
  if (store.$id === "config") {
    const tx = db.transaction("config", "readonly");
    const configStore = tx.objectStore("config");
    const keys = await configStore.getAllKeys();
    const rawConfig = await Promise.all(keys.map(async key => ({ key, value: await configStore.get(key) })));
    await tx.done;
    const config = rawConfig.reduce((acc, { key, value }) => ({ ...acc, [key.toString()]: value }), {}) as { showBetaBanner?: boolean };
    store.showBetaBanner = config.showBetaBanner ?? true;
    store.$subscribe(async (a) => {
      const tx = db.transaction("config", "readwrite");
      const configStore = tx.objectStore("config");
      await Promise.all(Object.entries(store.$state)
        .map(([key, value]) => configStore.put(value, key as MiBandDB["config"]["key"])));
      await tx.done;
    });
  } else if (store.$id === "bands") {
    const tx = db.transaction("bands", "readonly");
    const bandsStore = tx.objectStore("bands");
    store.bands = await bandsStore.getAll();
  }
}