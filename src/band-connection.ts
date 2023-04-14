declare global {
  const BluetoothUUID: {
    getService: (uuid: number | string) => string;
  }
}

const services = {
  band1: BluetoothUUID.getService(0xfee0),
  band2: BluetoothUUID.getService(0xfee1),
  alert: BluetoothUUID.getService(0x1811),
  deviceInfo: BluetoothUUID.getService("device_information")
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

export async function getBandMac(device: BluetoothDevice) {
  const gatt = await device?.gatt?.connect();
  if (!gatt) return;
  (await gatt.getPrimaryService(services.deviceInfo)).getCharacteristics()
}