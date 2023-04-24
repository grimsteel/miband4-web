import { nextTick } from "vue";
import TheAddBandModal from "../src/components/TheAddBandModal.vue";
import { type VueWrapper, flushPromises, mount } from "@vue/test-utils";
import { getBandMac } from "../src/band-connection";
import { getBandForMac } from "../src/local-db";
import type { Band } from "../src/types";

vi.mock("../src/band-connection.ts", () => ({
  requestDevice: vi.fn(() => Promise.resolve({ id: "Test" })),
  getBandMac: vi.fn(() => Promise.resolve("Test")),
}));

vi.mock("../src/local-db.ts", () => ({
  getBandForMac: vi.fn(() => Promise.resolve(undefined)),
}));

let wrapper: VueWrapper;
beforeEach(async () => {
  wrapper = mount(TheAddBandModal);
});

afterEach(() => void vi.clearAllMocks());

test("it should not show the error messages when first opened", async () => {
  expect(wrapper.find('[data-test="error-exists"]').exists()).toBe(false);
  expect(wrapper.find('[data-test="error-not-selected"]').exists()).toBe(false);
});

describe("the device not selected warning", () => {
  beforeEach(async () => {
    await wrapper.find('#nickname').setValue("Test");
    await wrapper.find('#auth-key').setValue("Test");
    await wrapper.find('form').trigger("submit");
    await nextTick();
  });
  it("should alert the user that a device wasn't selected", () => {
    expect(wrapper.find('[data-test="error-not-selected"]').exists()).toBe(true);
  });
  it("should go away when a user selects a device", async () => {
    await wrapper.find('[data-test="request-device"]').trigger("click");
    await nextTick();
    await flushPromises();
    expect(wrapper.find('[data-test="error-not-selected"]').exists()).toBe(false);
  });
  it("should appear if we can't get the mac of a device", async () => {
    vi.mocked(getBandMac).mockImplementationOnce(() => Promise.resolve(undefined));
    await wrapper.find('[data-test="request-device"]').trigger("click");
    await nextTick();
    await flushPromises();
    expect(wrapper.find('[data-test="error-not-selected"]').exists()).toBe(true);
  })
});

describe("the before close event", () => {
  it("should be fired when the user clicks the close button", async () => {
    await wrapper.find('[data-test="close"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("before-close");
  });
  it("should be fired with the new band", async () => {
    await wrapper.find('#nickname').setValue("Test");
    await wrapper.find('#auth-key').setValue("Test");
    await wrapper.find('[data-test="request-device"]').trigger("click");
    await nextTick();
    await flushPromises();
    await wrapper.find('form').trigger("submit");
    await nextTick();
    expect(wrapper.emitted()).toHaveProperty("before-close");
    const newBand = wrapper.emitted<[{ nickname: string, authKey: string, macAddress: string, deviceId: string }]>()["before-close"][0][0];
    expect(newBand).toHaveProperty("nickname", "Test");
    expect(newBand).toHaveProperty("authKey", "Test");
    expect(newBand).toHaveProperty("macAddress", "Test");
    expect(newBand).toHaveProperty("deviceId", "Test");
  });
});

describe("the band already exists error", () => {
  it("should appear if the band mac address is already in the database", async () => {
    vi.mocked(getBandMac).mockImplementationOnce(() => Promise.resolve("Test-mac"));
    vi.mocked(getBandForMac).mockImplementationOnce(() => Promise.resolve({ macAddress: "Test-mac" } as Band));
    await wrapper.find('#nickname').setValue("Test");
    await wrapper.find('#auth-key').setValue("Test");
    await wrapper.find('[data-test="request-device"]').trigger("click");
    await nextTick();
    await flushPromises();
    await wrapper.find('form').trigger("submit");
    await nextTick();
    expect(wrapper.find('[data-test="error-exists"]').exists()).toBe(true);
  });
});