# Mi Band 4 Web

A web interface for the Mi Smart Band 4 that respects your privacy.

Before you begin using it, you'll need your Mi Band 4's:

* Bluetooth MAC Address. This can be found by going to More > Settings > About on your band
* [Authentication Key](https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing).
  Note that this requires you to have previously created a Mi Fit account and paired your band with Mi Fit

This project is based off of [Satkar Dhakal's miband4](https://github.com/satcar77/miband4) which is licensed under the MIT license. It would not have been possible without the work there.

## Features:

✅: Complete

🕑: In Progress

❌: Not Started (but planned)

| Feature | Status | Notes |
| - | - | - |
| Device Info | ✅ | A bunch of random info that you'll never need |
| Status | ✅ | Steps, calories, distance |
| Battery | ✅ | Battery level, last charged, etc. |
| Heart Rate | ❌ | Low priority (accessible using the band) |
| Activity Data | 🕑 | Steps and heart rate history. Kind of buggy. |
| Alarms | ✅ | Write-only |
| Idle Alerts | ✅ | Write-only |
| Notifications | ❌ | This has no practical purpose |
| Music | ❌ | No practical purpose<sup>1</sup> |
| Goal Configuration | ✅ | Write-only |
| Band Time | ✅ | Read and write |
| Weather | ✅ | Set manually or from the internet |
| Band Display | ✅ | Write-only |
| Find My Band | ✅ | Makes the band vibrate |
| General Configuration<sup>2</sup> | ❌ | Write-only |

<sup>1</sup> Websites can't access what music you're playing, so you can only set what the band's music screen displays manually and see when the buttons are tapped.

<sup>2</sup> This includes band location, lift wrist to wake, night mode, and band lock.

<!-- TODO: Band language and distance unit  -->

## Reauthorization of Bluetooth Devices

### API Structure:

The only method for gaining permission to access a device is the `requestDevice` method. This shows a popup to the user for selecting a device. It does not allow the developer to filter by mac address or device ID.

#### Authorization "sessions":

When the user grants a website access to a device (with requestDevice), the website will be able to access that device as long as it keeps the corresponding `BluetoothDevice` in memory. (However, these are NOT structured cloneable, so we can't put them in IDB) This means that the user will need to "reauthenticate" the device (a new authentication session) on different tabs or when they refresh the page.

However, if the user enabled Web Bluetooth Persistent Permissions, the `BluetoothDevice` object will be persisted across tabs, refreshes, and browser restarts. This means that the user will only need to reauthenticate the device if they manually revoke the permission.

#### Device ID:

The device ID is a unique identifier for a device generated by the browser. It is not the same as the MAC address. _A new one is regenerated for every authentication session_. This means that we can't reliably identify a device based on its device ID.

### How we do it:

When a user requests a device with `requestDevice`, we store the device ID and MAC address in IDB. The primary key, however, is an incrementing integer. This is because we can't use the device ID as a primary key, since it is regenerated for every authentication session. **We also keep the BluetoothDevice in memory**

When a user opens a device, with our `id` primary key, we have to now obtain the corresponding `BluetoothDevice`

### Without persistent permissions:

When a user tries to open this device on the same tab that it was authorized in, we should have the corresponding device in memory, so we just try to find the correct device based on the device ID stored in Indexed DB.

> **Note**
> If the device ID stored in IDB changed (if the user reauthorized from another tab), then we won't be able to find the correct device. In this case, we will have to reauthorize the device.

When a user tries to open the device on another tab, or after refreshing/restarting the browser, we won't have the corresponding device in memory. In this case, we will have to reauthorize the device. This involves asking the user to select the correct device from the `requestDevice` popup. We then check that its correct by comparing the MAC address stored in IDB with the MAC address of the device that the user selected. (We can get the MAC address by reading a characteristic).

Once reauthorized, we store the new device ID in IDB, **just in case it changed**, and keep the new `BluetoothDevice` in memory.

### With persistent permissions:

We can detect that persistent permissions is enabled if the `getDevices` method exists.

When a user tries to open a device, we check to see if any of the devices returned by `getDevices` have the same device ID as the one stored in IDB. If it does, we return that device. If it doesn't, we reauthorize the device.

## Roadblocks Encountered

* `BluetoothDevice` objects are not structured cloneable. This means that we can't put them in IDB.
* Bluetooth Device IDs are randomly generated for every authentication session. This means that we can't reliably identify a device based on its device ID.
* TONS of errors can be encountered when connecting to devices. Reauthorization is the most reliable way 😑

## Bugs you should star:

* [Paired devices always created as BT Classic, but could be BLE](https://crbug.com/630581)
* [Implement watchAdvertisments](https://crbug.com/654897)
* [Get permitted devices](https://crbug.com/577953)
* [Implement Persistent Web Bluetooth Permissions](https://crbug.com/974879)
* [Bluetooth Device is no longer in range](https://crbug.com/1173186)