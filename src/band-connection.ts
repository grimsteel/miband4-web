interface BluetoothUUID {
  canonicalUUID(alias: string): string;
  getCharacteristic(uuid: number | string): string;
  getDescriptor(uuid: number | string): string;
  getService(uuid: number | string): string;
}

declare global {
  interface Window {
    BluetoothUUID: BluetoothUUID;
  }
  const BluetoothUUID: BluetoothUUID;
}

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

  async getService(name: number | string) {
    if (this.services[name]) return this.services[name];
    if (!this.device.gatt?.connected) throw new Error("Device is not connected");
    const service = await this.device.gatt.getPrimaryService(name);
    this.services[name] = service;
    return service;
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
    if (force || !this.device.gatt.connected) await this.device.gatt.connect();
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
  band1: window.BluetoothUUID.getService(0xfee0),
  band2: window.BluetoothUUID.getService(0xfee1),
  alert: window.BluetoothUUID.getService(0x1811),
  deviceInfo: window.BluetoothUUID.getService("device_information")
};

const characteristics = {
  systemId: window.BluetoothUUID.getCharacteristic("system_id"),
  hardwareRevision: window.BluetoothUUID.getCharacteristic("hardware_revision_string"),
  softwareRevision: window.BluetoothUUID.getCharacteristic("software_revision_string"),
  pnpId: window.BluetoothUUID.getCharacteristic("pnp_id"),
  auth: "00000009-0000-3512-2118-0009af100700",
  steps: "00000007-0000-3512-2118-0009af100700",
  batteryLevel: "00000006-0000-3512-2118-0009af100700",
  activityData: "00000005-0000-3512-2118-0009af100700",
  fetch: "00000004-0000-3512-2118-0009af100700",
  currentTime: window.BluetoothUUID.getCharacteristic("current_time"),
};

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
    }, 5000);
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

export async function authenticate(device: BluetoothDeviceWrapper, authKey: CryptoKey) {
  await device.connectIfNeeded();
  const authChar = await device.getCharacteristic(services.band2, characteristics.auth);
  //const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv: new Uint8Array(16) }, authKey, new Uint8Array(16));
  //await characteristic.writeValue(new Uint8Array(encrypted));
  return await new Promise(async (resolve, reject) => {
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
        } else if (byte1 === 0x03 && byte2 === 0x01) {
          await stopNotifications();
          resolve("Authenticated");
        } else if (byte1 === 0x03 && byte2 === 0x01) { 
          await stopNotifications();
          reject("Authentication failed");
        } else {
          await stopNotifications();
          reject(`Unknown authentication response: ${byte1} ${byte2}`);
        }
      } 
    };
    async function stopNotifications() {
      authChar.removeEventListener("characteristicvaluechanged", listener);
      await authChar.stopNotifications();
    }
    await authChar.startNotifications()
    authChar.addEventListener("characteristicvaluechanged", listener);
    await authChar.writeValueWithoutResponse(new Uint8Array([0x02, 0x00])); // prompt the band to send us a random number to encrypt
  });
}

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

export async function getBatteryLevel(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();
  const batteryLevelCharacteristic = await device.getCharacteristic(services.band1, characteristics.batteryLevel);
  const batteryLevelBytes = await batteryLevelCharacteristic.readValue();
  const batteryLevel = batteryLevelBytes.getUint8(1);
  const lastOff = new Date(batteryLevelBytes.getUint16(3, true), batteryLevelBytes.getUint8(5) - 1, batteryLevelBytes.getUint8(6), batteryLevelBytes.getUint8(7), batteryLevelBytes.getUint8(8), batteryLevelBytes.getUint8(9));
  const lastCharge = new Date(batteryLevelBytes.getUint16(11, true), batteryLevelBytes.getUint8(13) - 1, batteryLevelBytes.getUint8(14), batteryLevelBytes.getUint8(15), batteryLevelBytes.getUint8(16), batteryLevelBytes.getUint8(17));
  const lastLevel = batteryLevelBytes.getUint8(19);
  return {
    batteryLevel,
    lastOff,
    lastCharge,
    lastLevel
  };
}

export async function getSteps(device: BluetoothDeviceWrapper) {
  await device.connectIfNeeded();
  const stepsCharacteristic = await device.getCharacteristic(services.band1, characteristics.steps);
  const stepsBytes = await stepsCharacteristic.readValue();
  const steps = stepsBytes.getUint16(1, true); // FIXME not sure if this should be 16 or 32 (I mean who in their right mind would walk 2^32 steps)
  const meters = stepsBytes.getUint16(5, true);
  const calories = stepsBytes.getUint16(9, true); // TODO: Burn 255+ calories to see if this is 8 or 16
  // TODO: Find out how idle alerts work. Is it even possible?
  return {
    steps,
    meters,
    calories
  };
}

export async function getActivityData(device: BluetoothDeviceWrapper, startDate: Date, endDate: Date) {
  await device.connectIfNeeded();
  const currentTimeChar = await device.getCharacteristic(services.band1, characteristics.currentTime);
  const currentTimeBytes = await currentTimeChar.readValue();
  
  const fetchChar = await device.getCharacteristic(services.band1, characteristics.fetch);
  const activityDataChar = await device.getCharacteristic(services.band1, characteristics.activityData);

  const requestMore = async (fromTime: Date) => {
    const payload = new Uint8Array([0x01, 0x01, 
      startDate.getFullYear(), startDate.getFullYear() >> 8, startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes(),
      currentTimeBytes.getUint8(9), // bytes 9 to 10 is the timezone offset
      currentTimeBytes.getUint8(10),
    ]);

    await fetchChar.writeValueWithoutResponse(payload);
  }

  const fetchNotificationListener = async (event: Event) => {
  }

  const activityDataNotificationListener = async (event: Event) => {
  }

  await fetchChar.startNotifications();
  await activityDataChar.startNotifications();

  fetchChar.addEventListener("characteristicvaluechanged", fetchNotificationListener);
  activityDataChar.addEventListener("characteristicvaluechanged", activityDataNotificationListener);

  await requestMore(startDate);
}