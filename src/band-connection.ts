import type { ActivityItem, Alarm, ForecastDay, StoredActivityItem, Time } from "./types";

/**
 * This class is used to store the services, characteristics and descriptors in a cache.
 */
export class BluetoothDeviceWrapper {
  services: { [key: string]: BluetoothRemoteGATTService };
  chars: { [key: string]: BluetoothRemoteGATTCharacteristic };
  descriptors: { [key: string]: BluetoothRemoteGATTDescriptor };
  device: BluetoothDevice;

  constructor(device: BluetoothDevice) {
    this.services = {};
    this.chars = {};
    this.descriptors = {};
    this.device = device;
  }

  async fetchService(name: number | string) {
    const service = await this.device.gatt!.getPrimaryService(name);
    this.services[name] = service;
    return service;
  }

  async getService(name: number | string) {
    if (this.services[name]) return this.services[name];
    if (!this.device.gatt?.connected) await this.connectIfNeeded(true);
    if (!this.device.gatt?.connected) throw new Error("Cannot connect to device");
    try {
      return await this.fetchService(name);
    } catch (e) {
      if ((e as Error).message?.includes("connect")) {
        await this.connectIfNeeded(true);
        return await this.fetchService(name);
      } else throw e;
    }
  }

  async getCharacteristic(serviceName: number | string, name: number | string) {
    if (this.chars[name]) return this.chars[name];
    const service = await this.getService(serviceName);
    const characteristic = await service.getCharacteristic(name);
    this.chars[name] = characteristic;
    return characteristic;
  }

  async getDescriptor(serviceName: number | string, charName: number | string, name: number | string) {
    if (this.descriptors[name]) return this.descriptors[name];
    const characteristic = await this.getCharacteristic(serviceName, charName);
    const descriptor = await characteristic.getDescriptor(name);
    this.descriptors[name] = descriptor;
    return descriptor;
  }

  async connectIfNeeded(force=false) {
    if (!this.device.gatt) throw new Error("Cannot access gatt");
    if (force || !this.device.gatt.connected) {
      try {
        await this.device.gatt.connect();
        this.invalidateCache();
      } catch (e) {
        if ((e as Error).message?.includes("in range") && "watchAdvertisements" in this.device) {
          await connectAfterAdvertisment(this.device);
          this.invalidateCache();
        } else throw e;
      }
    }
  }

  invalidateCache() {
    this.services = {};
    this.chars = {};
    this.descriptors = {};
  }
  
  disconnect() {
    if (this.device.gatt?.connected) this.device.gatt.disconnect();
  }
}

if (!("BluetoothUUID" in window)) (window as Window & typeof globalThis & { BluetoothUUID: any }).BluetoothUUID = {
  getService() { return null; },
  getCharacteristic() { return null; }
};

const services = {
  band1: BluetoothUUID.getService(0xfee0),
  band2: BluetoothUUID.getService(0xfee1),
  alert: BluetoothUUID.getService(0x1811),
  deviceInfo: BluetoothUUID.getService("device_information")
};

const characteristics = {
  systemId: BluetoothUUID.getCharacteristic("system_id"),
  hardwareRevision: BluetoothUUID.getCharacteristic("hardware_revision_string"),
  softwareRevision: BluetoothUUID.getCharacteristic("software_revision_string"),
  pnpId: BluetoothUUID.getCharacteristic("pnp_id"),
  chunkedTransfer: "00000020-0000-3512-2118-0009af100700",
  auth: "00000009-0000-3512-2118-0009af100700",
  settings: "00000008-0000-3512-2118-0009af100700",
  steps: "00000007-0000-3512-2118-0009af100700",
  batteryLevel: "00000006-0000-3512-2118-0009af100700",
  activityData: "00000005-0000-3512-2118-0009af100700",
  fetch: "00000004-0000-3512-2118-0009af100700",
  configuration: "00000003-0000-3512-2118-0009af100700",
  currentTime: BluetoothUUID.getCharacteristic("current_time"),
};

const oneMinute = 60 * 1000;
const maxChunklength = 17;

export const webBluetoothSupported = async () => "bluetooth" in navigator && await navigator.bluetooth.getAvailability();

export const authKeyStringToKey = async (keyString: string) => {
  const hexParts = keyString.match(/.{1,2}/g);
  if (!hexParts || hexParts.length !== 16) throw new Error("Invalid key format")
  const byteArray = new Uint8Array(hexParts.map(el => parseInt(el, 16))); // convert to numbers
  return await crypto.subtle.importKey("raw", byteArray, "AES-CBC", true, ["encrypt", "decrypt"]);
}

async function encryptWithKey(key: CryptoKey, value: ArrayBuffer) {
  const iv = new Uint8Array(16);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, value);
  return new Uint8Array(encrypted.slice(0, 16)); // we only need the first 16 bytes
}

/** Wait for an advertisment then connect */
async function connectAfterAdvertisment(bluetoothDevice: BluetoothDevice) {
  const abortController = new AbortController();
  await bluetoothDevice.watchAdvertisements({ signal: abortController.signal });
  return await new Promise((resolve, reject) => {
    bluetoothDevice.addEventListener("advertisementreceived", async () => {
      await bluetoothDevice.gatt?.connect();
      abortController.abort();
      resolve("Connected");
    });
    setTimeout(() => {
      abortController.abort();
      reject("Timeout");
    }, 10000);
  });
}

function concatUint8Arrays(buffer1: Uint8Array, buffer2: Uint8Array) {
  const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  combined.set(buffer1, 0);
  combined.set(buffer2, buffer1.byteLength);
  return combined;
}

export const requestDevice = async () => {
  try {
    return await navigator.bluetooth.requestDevice({ filters: [{ services: [services.band1] }], optionalServices: Object.values(services) });
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getBandMac(device: BluetoothDevice, callbacks?: {
  onConnecting?: () => void;
  onGettingService?: () => void;
  onGettingCharacteristic?: () => void;
  onReadingValue?: () => void;
}) {
  callbacks?.onConnecting?.();
  let gatt;
  try {
    gatt = await device?.gatt?.connect();
    if (!gatt) return;
    callbacks?.onGettingService?.();
    const deviceInfoService = await gatt.getPrimaryService(services.deviceInfo);
    callbacks?.onGettingCharacteristic?.();
    const systemIdCharacteristic = await deviceInfoService.getCharacteristic(characteristics.systemId);
    callbacks?.onReadingValue?.();
    const systemId = await systemIdCharacteristic.readValue();
    const hexArray = Array.from(new Uint8Array(systemId.buffer)).map(b => b.toString(16).padStart(2, "0"));
    hexArray.splice(3, 2); // remove the 0xfffe
    return hexArray.join(":").toUpperCase();
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    gatt?.disconnect();
  }
}

/** Authenticate to the band by encrypting a random number it sends with the authKey */
export async function authenticate(device: BluetoothDeviceWrapper, authKey: CryptoKey) {
  await device.connectIfNeeded();
  const authChar = await device.getCharacteristic(services.band2, characteristics.auth);
  //const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv: new Uint8Array(16) }, authKey, new Uint8Array(16));
  //await characteristic.writeValue(new Uint8Array(encrypted));
  return await new Promise(async (resolve, reject) => {
    let resolved = false;
    const listener = async (event: Event) => {
      const valueDataView = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (!valueDataView) return;
      if (valueDataView.getUint8(0) === 0x10) { // all the commands we care about start with 0x10
        const byte1 = valueDataView.getUint8(1);
        const byte2 = valueDataView.getUint8(2);
        if (byte1 === 0x01 && byte2 === 0x01) console.debug("[Authentication]: OK");
        else if (byte1 === 0x02 && byte2 === 0x01) {
          // the band has given us a random number to encrypt
          const randomNumber = valueDataView.buffer.slice(3);
          const encrypted = await encryptWithKey(authKey, randomNumber);
          await authChar.writeValueWithoutResponse(concatUint8Arrays(new Uint8Array([0x03, 0x00]), encrypted));
        } else if (!resolved && byte1 === 0x03 && byte2 === 0x01) {
          await stopResolving();
          resolve("Authenticated");
        } else if (!resolved && byte1 === 0x03 && byte2 === 0x01) { 
          await stopResolving();
          reject("Authentication failed");
        }  else if (!resolved && byte1 === 0x03 && byte2 === 0x08) { 
          await stopResolving();
          reject("Incorrect auth key");
        } else if (!resolved) {
          await stopResolving();
          reject(`Unknown authentication response: ${byte1} ${byte2}`);
        }
      } 
    };
    async function stopResolving() {
      resolved = true;
    }
    await authChar.startNotifications()
    authChar.addEventListener("characteristicvaluechanged", listener);
    await authChar.writeValueWithoutResponse(new Uint8Array([0x02, 0x00])); // prompt the band to send us a random number to encrypt
  });
}

/** Get the mac, software/hardware revisions, and info in the PNP id */
export async function getDeviceInfo(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();

  // Mac Address
  const systemIdCharacteristic = await device.getCharacteristic(services.deviceInfo, characteristics.systemId);
  const systemId = await systemIdCharacteristic.readValue();
  const hexArray = Array.from(new Uint8Array(systemId.buffer)).map(b => b.toString(16).padStart(2, "0"));
  hexArray.splice(3, 2); // remove the 0xfffe
  const mac = hexArray.join(":").toUpperCase();

  // Hardware Revision
  const hardwareRevisionCharacteristic = await device.getCharacteristic(services.deviceInfo, characteristics.hardwareRevision);
  const hardwareRevisionBytes = await hardwareRevisionCharacteristic.readValue();
  const hardwareRevision = new TextDecoder().decode(hardwareRevisionBytes);

  // Software Revision
  const softwareRevisionCharacteristic = await device.getCharacteristic(services.deviceInfo, characteristics.softwareRevision);
  const softwareRevisionBytes = await softwareRevisionCharacteristic.readValue();
  const softwareRevision = new TextDecoder().decode(softwareRevisionBytes);


  // PNP ID
  const pnpIdCharacteristic = await device.getCharacteristic(services.deviceInfo, characteristics.pnpId);
  const pnpIdBytes = await pnpIdCharacteristic.readValue();
  const vendorId = pnpIdBytes.getUint16(1, true);
  const productId = pnpIdBytes.getUint16(3, true);
  const productVersion = pnpIdBytes.getUint16(5, true);

  return {
    macAddress: mac,
    hardwareRevision,
    firmwareVersion: softwareRevision,
    vendorId,
    productId,
    productVersion
  };
}

/** Get the battery level and other battery stats (last charged) */
export async function getBatteryLevel(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();
  const batteryLevelCharacteristic = await device.getCharacteristic(services.band1, characteristics.batteryLevel);
  const batteryLevelBytes = await batteryLevelCharacteristic.readValue();
  const batteryLevel = batteryLevelBytes.getUint8(1);
  const isCharging = batteryLevelBytes.getUint8(2) !== 0;
  const lastOff = new Date(batteryLevelBytes.getUint16(3, true), batteryLevelBytes.getUint8(5) - 1, batteryLevelBytes.getUint8(6), batteryLevelBytes.getUint8(7), batteryLevelBytes.getUint8(8), batteryLevelBytes.getUint8(9));
  const lastCharge = new Date(batteryLevelBytes.getUint16(11, true), batteryLevelBytes.getUint8(13) - 1, batteryLevelBytes.getUint8(14), batteryLevelBytes.getUint8(15), batteryLevelBytes.getUint8(16), batteryLevelBytes.getUint8(17));
  const lastLevel = batteryLevelBytes.getUint8(19);
  return {
    batteryLevel,
    lastOff,
    lastCharge,
    lastLevel,
    isCharging
  };
}

/** Get the current steps, distance, and calories burned */
export async function getCurrentStatus(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();
  const stepsCharacteristic = await device.getCharacteristic(services.band1, characteristics.steps);
  const stepsBytes = await stepsCharacteristic.readValue();
  const steps = stepsBytes.getUint16(1, true); // FIXME not sure if this should be 16 or 32 (I mean who in their right mind would walk 2^32 steps)
  const meters = stepsBytes.getUint16(5, true); // Defaults to meters
  const calories = stepsBytes.getUint8(9); // TODO: Burn 255+ calories to see if this is 8 or 16
  // TODO: Find out how idle alerts work. Is it even possible?
  return {
    steps,
    meters,
    calories
  };
}

/** Group and aggregate the raw minute by minute activity data by hour */
function parseActivityData(activityData: ActivityItem[]): StoredActivityItem[] {
  // Group the data by hour
  const groupedByHour = activityData.reduce((acc, item) => {
    const hour = new Date(item.timestamp.getFullYear(), item.timestamp.getMonth(), item.timestamp.getDate(), item.timestamp.getHours()).getTime();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(item);
    return acc;
  }, {} as { [hour: string]: ActivityItem[] });

  const parsedData = Object.entries(groupedByHour).map(([key, items]) => {
    const totalSteps = items.reduce((acc, item) => acc + item.steps, 0);
    const averageHeartRate = items.reduce((acc, item) => acc + item.heartRate, 0) / items.length;
    return {
      totalSteps,
      averageHeartRate,
      timestamp: new Date(parseInt(key))
    };
  });

  return parsedData;
}

/** Fetch step/heart rate history */
export async function getActivityData(
  device: BluetoothDeviceWrapper,
  startDate: Date,
  endDate: Date,
  listeners?: Partial<{ onDataReceived: (timestamp: Date) => void, onBatchFinished: (items: StoredActivityItem[]) => void }>
) {
  await device.connectIfNeeded();
  const currentTimeChar = await device.getCharacteristic(services.band1, characteristics.currentTime);
  const currentTimeBytes = await currentTimeChar.readValue();
  
  const fetchChar = await device.getCharacteristic(services.band1, characteristics.fetch);
  const activityDataChar = await device.getCharacteristic(services.band1, characteristics.activityData);

  return await new Promise<void>(async resolve => {
    let firstTimestamp: Date, lastTimestamp: Date, pkg = 0;
    let activityData: ActivityItem[] = [];

    const flushActivityData = () => {
      if (activityData.length === 0) return;
      const dataToFlush = activityData;
      activityData = [];
      const parsedData = parseActivityData(dataToFlush);
      listeners?.onBatchFinished?.(parsedData);
    }
    
    /** Send the band a request to get more data from the specified date */
    const requestMore = async (fromTime: Date) => {
      const payload = new Uint8Array([0x01, 0x01, 
        fromTime.getFullYear(), fromTime.getFullYear() >> 8, fromTime.getMonth() + 1, fromTime.getDate(), fromTime.getHours(), fromTime.getMinutes(),
        currentTimeBytes.getUint8(9), // bytes 9 to 10 is the timezone offset
        currentTimeBytes.getUint8(10),
      ]);

      await fetchChar.writeValueWithoutResponse(payload);
    }

    const closeAndResolve = async () => {
      flushActivityData();
      activityDataChar.removeEventListener("characteristicvaluechanged", activityDataNotificationListener);
      fetchChar.removeEventListener("characteristicvaluechanged", fetchNotificationListener);
      await activityDataChar.stopNotifications();
      await fetchChar.stopNotifications();
      resolve();
    }

    const fetchNotificationListener = async (event: Event) => {
      const valueDataView = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (!valueDataView) return;
      const [b1, b2, b3] = [valueDataView.getUint8(0), valueDataView.getUint8(1), valueDataView.getUint8(2)];
      if (b1 === 0x10 && b2 === 0x01 && b3 === 0x01) {
        // Received an activity packet start date
        firstTimestamp = new Date(valueDataView.getUint16(7, true), valueDataView.getUint8(9) - 1, valueDataView.getUint8(10), valueDataView.getUint8(11), valueDataView.getUint8(12));
        console.debug(`Fetching data from ${firstTimestamp.toLocaleString()}`);
        pkg = 0;
        await fetchChar.writeValueWithoutResponse(new Uint8Array([0x02]));
      } else if (b1 === 0x10 && b2 === 0x02 && b3 === 0x01) {
        if (lastTimestamp.getTime() > endDate.getTime() - oneMinute) return await closeAndResolve();
        console.debug(`Fetching more data`);
        setTimeout(() => requestMore(new Date(lastTimestamp.getTime() + oneMinute)), 1000); // Wait 1 second before requesting more data
      } else if (b1 === 0x10 && b2 === 0x02 && b3 === 0x04) await closeAndResolve();
      else console.log(b1,b2,b3)
    }

    const activityDataNotificationListener = async (event: Event) => {
      const valueDataView = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (!valueDataView) return;
      if (valueDataView.byteLength % 4 === 1) {
        pkg++;
        // start at 1 to skip the first byte
        for (let i = 1; i < valueDataView.byteLength; i += 4) {
          const minutesOffset = pkg * 4 + (i - 1) / 4;
          lastTimestamp = new Date(firstTimestamp.getTime() + minutesOffset * oneMinute);
          if (lastTimestamp < endDate) {
            const activityItem = {
              category: valueDataView.getUint8(i),
              intensity: valueDataView.getUint8(i + 1),
              steps: valueDataView.getUint8(i + 2),
              heartRate: valueDataView.getUint8(i + 3),
              timestamp: lastTimestamp
            };
            activityData.push(activityItem);
            listeners?.onDataReceived?.(lastTimestamp);
            if (activityData.length >= 1000) flushActivityData();
          }
        }
      }
    }

    await fetchChar.startNotifications();
    await activityDataChar.startNotifications();

    fetchChar.addEventListener("characteristicvaluechanged", fetchNotificationListener);
    activityDataChar.addEventListener("characteristicvaluechanged", activityDataNotificationListener);

    await requestMore(startDate);
  });
}

/** Turn notifications for the step goal on or off */
export async function setGoalNotifications(device: BluetoothDeviceWrapper, goalNotifications: boolean) {
  await device.connectIfNeeded();
  const charConfig = await device.getCharacteristic(services.band1, characteristics.configuration);
  const payload = new Uint8Array([0x06, 0x06, 0x00, goalNotifications ? 0x01 : 0x00]);
  await charConfig.writeValueWithoutResponse(payload);
}

/** Set the daily step goal */
export async function setActivityGoal(device: BluetoothDeviceWrapper, steps: number) {
  await device.connectIfNeeded();
  const charConfig = await device.getCharacteristic(services.band1, characteristics.settings);
  const payload = new Uint8Array([0x10, 0x00, 0x00, steps, steps >> 8, 0x00, 0x00]);
  await charConfig.writeValueWithResponse(payload); // This one needs a response. Not sure why.
}

/** Get the band's current system time */
export async function getCurrentTime(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();
  const currentTimeChar = await device.getCharacteristic(services.band1, characteristics.currentTime);
  const currentTimeBytes = await currentTimeChar.readValue();

  const currentTime = new Date(
    currentTimeBytes.getUint16(0, true), // year
    currentTimeBytes.getUint8(2) - 1, // month
    currentTimeBytes.getUint8(3), // day
    currentTimeBytes.getUint8(4), // hour
    currentTimeBytes.getUint8(5), // minute
    currentTimeBytes.getUint8(6), // second
  );
  return currentTime;
}

/** Set the band's system time */
export async function setCurrentTime(device: BluetoothDeviceWrapper, time: Date) {
  const payload = new Uint8Array([
    time.getFullYear(), time.getFullYear() >> 8,
    time.getMonth() + 1,
    time.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getDay(),
    0x00,
    0x00,
    0x00
  ]);
  await device.connectIfNeeded();
  const currentTimeChar = await device.getCharacteristic(services.band1, characteristics.currentTime);
  await currentTimeChar.writeValueWithResponse(payload);
}

/** Configure idle alerts on the device */
export async function setIdleAlerts(device: BluetoothDeviceWrapper, enabled: boolean, startTime: Time, endTime: Time) {
  await device.connectIfNeeded();
  const charConfig = await device.getCharacteristic(services.band1, characteristics.configuration);
  const payload = new Uint8Array([
    0x08, enabled ? 0x01 : 0x00, 0x3c, 0x00,
    startTime.hour, startTime.minute, endTime.hour, endTime.minute,
    0x00, 0x00, 0x00, 0x00
  ]);
  await charConfig.writeValueWithoutResponse(payload);
}

export async function setAlarm(device: BluetoothDeviceWrapper, alarm: Alarm) {
  await device.connectIfNeeded();
  const charConfig = await device.getCharacteristic(services.band1, characteristics.configuration);
  const repetitionMask = [...alarm.days].reduce((acc, day) => acc | (1 << day), 0);
  const alarmTag = alarm.id | (alarm.enabled ? 0x80 : 0x00);
  console.log(alarm.time);
  const payload = new Uint8Array([
    0x02, alarmTag, alarm.time.hour, alarm.time.minute, repetitionMask
  ]);
  await charConfig.writeValueWithoutResponse(payload);
}

async function writeChunked(device: BluetoothDeviceWrapper, type: number, data: Uint8Array) {
  const charChunkedTransfer = await device.getCharacteristic(services.band1, characteristics.chunkedTransfer);
  for (let remaining = data.byteLength, count = 0; remaining > 0; count++) {
    const bytesToCopy = Math.min(remaining, maxChunklength);
    let flag = 0;
    if (remaining <= maxChunklength) { // last payload
      flag |= 0x80;
      if (count === 0) flag |= 0x40; // first and last payload
    } else if (count > 0) { // middle payload
      flag |= 0x40;
    }
    const payload = concatUint8Arrays(new Uint8Array([0, flag | type, count & 0xff]), data.slice(count * maxChunklength, count * maxChunklength + bytesToCopy));
    await charChunkedTransfer.writeValueWithoutResponse(payload);
    remaining -= bytesToCopy;
  }
}

export async function setWeather(device: BluetoothDeviceWrapper, city: string, airIndex: number, currentIcon: number, currentTemp: number, forecast: ForecastDay[]) {
  await device.connectIfNeeded();
  const encoder = new TextEncoder();
  const cityPayload = new Uint8Array([0x08, ...encoder.encode(city), 0x00]);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeBytes = [currentTime, currentTime >> 8, currentTime >> 16, currentTime >> 24];
  const airIndexPayload = new Uint8Array([0x04, ...timeBytes, 0xec, airIndex, 0x00, 0x00]);
  const currentTempPayload = new Uint8Array([0x02, ...timeBytes, 0xec, currentIcon, currentTemp, 0x41, 0x00]); // Same as above
  const forecastBytes = forecast.flatMap(({ high, low, text, icon }) => [icon, 0x00, high, low, ...encoder.encode(text), 0x00]);
  const forecastPayload = new Uint8Array([0x01, ...timeBytes, 0xec, forecast.length, ...forecastBytes]);
  await writeChunked(device, 0x01, cityPayload);
  await writeChunked(device, 0x01, airIndexPayload);
  await writeChunked(device, 0x01, currentTempPayload);
  await writeChunked(device, 0x01, forecastPayload);
}