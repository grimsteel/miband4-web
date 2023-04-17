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
  systemId: BluetoothUUID.getCharacteristic("system_id")
};

export const webBluetoothSupported = async () => "bluetooth" in navigator && await navigator.bluetooth.getAvailability();

export const authKeyStringToKey = async (keyString: string) => {
  const hexParts = keyString.match(/.{1,2}/g);
  if (!hexParts || hexParts.length !== 16) throw new Error("Invalid key format")
  const byteArray = new Uint8Array(hexParts.map(el => parseInt(el, 16))); // convert to numbers
  return await crypto.subtle.importKey("raw", byteArray, "AES-CBC", true, ["encrypt", "decrypt"]);
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