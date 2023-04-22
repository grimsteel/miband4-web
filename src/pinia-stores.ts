import { addBand, updateBandForId, removeBand, getDb } from "./local-db";
import { type PiniaPluginContext, defineStore } from "pinia";
import type { Band, MiBandDB, UnsavedBand, Config } from "./types";

declare module "pinia" {
  export interface PiniaCustomProperties extends Config {
    bands: Band[];
  }
}

const bandDateMs = ({ dateAdded }: Band) => Number(dateAdded);
const defaultDistanceUnit = "miles";

export const useConfigStore = defineStore("config", {
  state: () => ({
    showBetaBanner: false,
    distanceUnit: defaultDistanceUnit
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
    async addBand(bandData: UnsavedBand) {
      const newBand = await addBand(bandData);
      this.bands = [...this.bands, newBand];
    },
    async updateBandForId(id: number, bandData: Partial<Band>) {
      await updateBandForId(id, bandData);
      this.bands = this.bands.map(b => b.id === id ? { ...b, ...bandData } : b);
    },
    async removeBand(id: number) {
      await removeBand(id);
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
    const config = rawConfig.reduce((acc, { key, value }) => ({ ...acc, [key.toString()]: value }), {}) as Partial<Config>;
    store.showBetaBanner = config.showBetaBanner ?? true;
    store.distanceUnit = config.distanceUnit || defaultDistanceUnit;
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
