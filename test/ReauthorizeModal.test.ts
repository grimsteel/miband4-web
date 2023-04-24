import { type VueWrapper, mount, flushPromises } from "@vue/test-utils";
import ReauthorizeModal from "../src/components/ReauthorizeModal.vue";
import { getBandMac, requestDevice } from "../src/band-connection";

vi.mock("../src/band-connection.ts", () => ({
  requestDevice: vi.fn(() => Promise.resolve({ id: "Test" })),
  getBandMac: vi.fn(() => Promise.resolve("Test-mac")),
}));

let wrapper: VueWrapper;
beforeEach(async () => {
  wrapper = mount(ReauthorizeModal, {
    props: {
      targetDevice: {
        deviceId: "Test-id",
        macAddress: "Test-mac"
      }
    },
    global: {
      stubs: {
        "router-link": true,
      }
    }
  });
});

afterEach(() => void vi.clearAllMocks());

test("the modal should close when the user clicks the close button", async () => {
  await wrapper.find('[data-test="close"]').trigger("click");
  expect(wrapper.emitted()).toHaveProperty("before-close");
  expect(wrapper.emitted<[boolean]>()["before-close"][0][0]).toBe(false);
});

test("the modal should close if the selected device's id matches", async () => {
  vi.mocked(requestDevice).mockImplementationOnce(() => Promise.resolve({ id: "Test-id" } as BluetoothDevice));
  await wrapper.find('[data-test="request-device"]').trigger("click");
  await flushPromises();
  expect(wrapper.emitted()).toHaveProperty("before-close");
  expect(wrapper.emitted<[boolean]>()["before-close"][0][0]).toBe(true);
  expect(vi.mocked(getBandMac)).not.toHaveBeenCalled();
});

test("the modal should get the mac address if the ids don't match", async () => {
  await wrapper.find('[data-test="request-device"]').trigger("click");
  await flushPromises();
  expect(wrapper.emitted()).toHaveProperty("before-close");
  expect(wrapper.emitted<[boolean, BluetoothDevice]>()["before-close"][0][0]).toBe(true);
  expect(wrapper.emitted<[boolean, BluetoothDevice]>()["before-close"][0][1]).toStrictEqual({ id: "Test" });
  expect(vi.mocked(getBandMac)).toHaveBeenCalled();
});

test("the modal should alert the user if the mac addresses don't match", async () => {
  vi.mocked(getBandMac).mockImplementationOnce(() => Promise.resolve("Test-mac-2"));
  await wrapper.find('[data-test="request-device"]').trigger("click");
  await flushPromises();
  expect(wrapper.find('[data-test="incorrect-band"]').exists()).toBe(true);
});