import { type DBSchema, openDB } from "idb";
import { type PiniaPluginContext, defineStore } from "pinia";

export interface Band {
  id: number;
  nickname: string;
  macAddress: string;
  authKey: string;
  dateAdded: Date;
  deviceId: string;
};

interface MiBandDB extends DBSchema {
  config: {
    key: "showBetaBanner";
    value: boolean
  };
  bands: {
    key: number;
    value: Band;
    indexes: {
      macAddress: string;
      deviceId: string;
    };
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
      const bandStore = db.createObjectStore("bands", { autoIncrement: true, keyPath: "id" });
      bandStore.createIndex("macAddress", "macAddress");
      bandStore.createIndex("deviceId", "deviceId");
    }
  });
}

const bandDateMs = ({ dateAdded }: Band) => Number(dateAdded);

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
    bands: [],
    // This is a list of devices we can access so we don't have to request them every time.
    // It's unused when the browser supports navigator.bluetooth.getDevices()
    authorizedDevices: [] 
  } as { bands: Band[], authorizedDevices: BluetoothDevice[] }),
  actions: {
    sortBandsByCreated(direction: "ASC" | "DESC" = "DESC") {
      return [...this.bands].sort((a, b) => direction === "ASC" ? bandDateMs(a) - bandDateMs(b) : bandDateMs(b) - bandDateMs(a));
    },
    async addBand(bandData: Pick<Band, "authKey" | "macAddress" | "nickname" | "deviceId">) {
      const band = {
        ...bandData,
        dateAdded: new Date()
      };
      const db = await getDb();
      const bandId = await db.put("bands", band as Band);
      this.bands = [...this.bands, {
        ...band,
        id: bandId
      }];
    },
    async getBand(id: number) {
      const db = await getDb();
      return await db.get("bands", id);
    },
    async getBandForDeviceId(deviceId: string) {
      const db = await getDb();
      return await db.getFromIndex("bands", "deviceId", deviceId);
    },
    async getBandForMac(macAddress: string) {
      const db = await getDb();
      return await db.getFromIndex("bands", "macAddress", macAddress);
    },
    async updateBandForId(id: number, bandData: Partial<Band>) {
      const db = await getDb();
      const existingBand = await db.get("bands", id);
      if (!existingBand) return;
      await db.put("bands", {
        ...existingBand,
        ...bandData,
      });
      this.bands = this.bands.map(b => b.id === id ? { ...b, ...bandData } : b);
    },
    async removeBand(id: number) {
      const db = await getDb();
      await db.delete("bands", id);
      this.bands = this.bands.filter(b => b.id !== id);
    },
    addAuthorizedDevice(device: BluetoothDevice) {
      if (this.authorizedDevices.find(({ id }) => id === device.id)) return;
      this.authorizedDevices = [...this.authorizedDevices, device];
    },
    async removeAuthorizedDevice(deviceId: string) {
      const device = await this.getAuthorizedDeviceById(deviceId);
      if (device) {
        if (device.gatt?.connected) device.gatt.disconnect();
        if ("forget" in device) await device.forget();
      }
      this.authorizedDevices = this.authorizedDevices.filter(({ id }) => id !== deviceId);
    },
    /** Get an authorized device by its ID. Use the getDevices() method of possible */
    async getAuthorizedDeviceById(id: string) {
      if ("getDevices" in navigator.bluetooth) {
        const devices = await navigator.bluetooth.getDevices();
        return devices.find(d => d.id === id);
      }
      return this.authorizedDevices.find(b => b.id === id);
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
    store.$subscribe(async () => {
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
    await tx.done;
  }
}
