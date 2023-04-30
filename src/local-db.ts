import { openDB } from "idb";
import type { Band, MiBandDB, StoredActivityItem, UnsavedBand } from "./types";

// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1
const MAX_DATE = new Date(8640000000000000);
const MIN_DATE = new Date(-8640000000000000);

export async function getDb() {
  return await openDB<MiBandDB>("miband4-web-db", 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) // if we're upgrading from a version below 1
        db.createObjectStore("config");
      if (oldVersion < 2) {
        const bandStore = db.createObjectStore("bands", { autoIncrement: true, keyPath: "id" });
        bandStore.createIndex("macAddress", "macAddress");
        bandStore.createIndex("deviceId", "deviceId");
      }
      const activityStore = db.createObjectStore("activityData", { autoIncrement: true, keyPath: "id" });
      activityStore.createIndex("bandId-timestamp", ["bandId", "timestamp"], { unique: false });
    }
  });
}

export async function getBand(id: number) {
  const db = await getDb();
  const band = await db.get("bands", id);
  db.close();
  return band;
}

export async function getBandForDeviceId(deviceId: string) {
  const db = await getDb();
  const band = await db.getFromIndex("bands", "deviceId", deviceId);
  db.close();
  return band;
}

export async function getBandForMac(macAddress: string) {
  const db = await getDb();
  const band =  await db.getFromIndex("bands", "macAddress", macAddress);
  db.close();
  return band;
}

/**
 * Add a single band to the database
 * This method should not be called directly, use the addBand action on the Pinia store instead
 */
export async function addBand(bandData: UnsavedBand) {
  const band = {
    ...bandData,
    dateAdded: new Date()
  };
  const db = await getDb();
  const bandId = await db.put("bands", band as Band);
  db.close();
  return {
    ...band,
    id: bandId
  };
}

/**
 * Update a band in the database
 * This method should not be called directly, use the updateBand action on the Pinia store instead
 */
export async function updateBandForId(id: number, bandData: Partial<Band>) {
  const db = await getDb();
  const existingBand = await db.get("bands", id);
  if (!existingBand) return;
  await db.put("bands", {
    ...existingBand,
    ...bandData,
  });
  db.close();
}

/**
 * Remove a band from the database
 * This method should not be called directly, use the removeBand action on the Pinia store instead
 */
export async function removeBand(id: number) {
  const db = await getDb();
  const tx = db.transaction(["bands", "activityData"], "readwrite");
  await tx.objectStore("bands").delete(id);
  let idDeleteCursor = await tx.objectStore("activityData").index("bandId-timestamp").openKeyCursor(IDBKeyRange.bound([id, MIN_DATE], [id, MAX_DATE]));
  while (idDeleteCursor) {
    await tx.objectStore("activityData").delete(idDeleteCursor.primaryKey);
    idDeleteCursor = await idDeleteCursor.continue();
  }
  await tx.done;
  db.close();
}

export async function addActivityData(bandId: number, data: StoredActivityItem[]) {
  const db = await getDb();
  // Group the data by day
  const dataByDay = data.reduce((acc, item) => {
    const dayStart = new Date(item.timestamp.getFullYear(), item.timestamp.getMonth(), item.timestamp.getDate()).getTime().toString();
    if (!acc[dayStart]) acc[dayStart] = [];
    acc[dayStart].push(item);
    return acc;
  }, {} as Record<string, StoredActivityItem[]>);

  const tx = db.transaction("activityData", "readwrite");
  const bidTimestampIndex = tx.objectStore("activityData").index("bandId-timestamp");
  for (const dayStart of Object.keys(dataByDay)) {
    const cursor = await bidTimestampIndex.openCursor(IDBKeyRange.only([bandId, new Date(parseInt(dayStart))]));
    if (cursor?.value) {
      // If we already have data for this day, merge it
      const existingData = cursor.value.items;
      const newData = dataByDay[dayStart];
      // If two items have the same timestamp, use the one from newData
      const mergedData = [...newData, ...existingData].reduce((acc, item) => {
        if (!acc.find(i => i.timestamp.getTime() === item.timestamp.getTime())) acc.push(item);
        return acc;
      }, [] as StoredActivityItem[]).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      await cursor.update({
        ...cursor.value,
        items: mergedData
      });
      continue;
    } else {
      // If we don't have data for this day, add it
      await tx.objectStore("activityData").add({
        bandId,
        timestamp: new Date(parseInt(dayStart)),
        items: dataByDay[dayStart]
      } as any);
    }
  }
  await tx.done;
  db.close();
}

export async function queryActivityData(bandId: number, startDate: Date, endDate: Date, shouldAggregateByDay = false) {
  const db = await getDb();
  const tx = db.transaction("activityData", "readonly");
  const activityStore = tx.objectStore("activityData");
  let cursor = await activityStore.index("bandId-timestamp").openCursor(IDBKeyRange.bound([bandId, startDate], [bandId, endDate]));
  const data: StoredActivityItem[] = [];
  while (cursor) {
    if (!shouldAggregateByDay)
      data.push(...cursor.value.items);
    else {
      const dayStart = new Date(cursor.value.timestamp.getFullYear(), cursor.value.timestamp.getMonth(), cursor.value.timestamp.getDate());
      const totalSteps = cursor.value.items.reduce((acc, item) => acc + item.totalSteps, 0);
      const itemsWithHeartRate = cursor.value.items.filter(item => item.averageHeartRate);
      const averageHeartRate = itemsWithHeartRate.reduce((acc, item) => acc + item.averageHeartRate!, 0) / itemsWithHeartRate.length;
      data.push({
        timestamp: dayStart,
        totalSteps,
        averageHeartRate
      });
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  db.close();
  return data;
}
