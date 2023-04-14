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

export const requestDevice = async () => {
  await navigator.bluetooth.requestDevice({ filters: [{ services: [services.band1] }], optionalServices: Object.values(services) });
}