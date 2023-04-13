import { openDB } from "idb";
import { defineStore } from "pinia";

async function getDb() {
  return await openDB("miband4-web-db", 1, {
    upgrade(db) {
      db.createObjectStore("config");
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

/** @param {{ store: import("pinia").Store }} param0 */
export async function indexedDbPlugin({ store }) {
  const db = await getDb();
  if (store.$id === "config") {
    const tx = db.transaction("config", "readonly");
    const configStore = tx.objectStore("config");
    const keys = await configStore.getAllKeys();
    const rawConfig = await Promise.all(keys.map(async key => ({ key, value: await configStore.get(key) })));
    await tx.done;
    const config = rawConfig.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    store.$patch({
      showBetaBanner: true,
      ...config
    });
    store.$subscribe(async () => {
      const tx = db.transaction("config", "readwrite");
      const configStore = tx.objectStore("config");
      await Promise.all(Object.entries(store.$state)
        .map(([key, value]) => configStore.put(value, key)));
      await tx.done;
    });
  }
}