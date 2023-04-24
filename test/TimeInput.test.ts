import { mount, type VueWrapper } from "@vue/test-utils";
import TimeInput from "../src/components/TimeInput.vue";

let wrapper: VueWrapper;
beforeEach(async () => {
  wrapper = mount(TimeInput, {
    props: {
      modelValue: { hour: 12, minute: 0 },
      text: "Test",
      inputId: "test"
    }
  });
});

test("it should emit an input event when the time is changed", async () => {
  await wrapper.find('input').setValue(65700000);
  await wrapper.find("input").trigger("input");
  expect(wrapper.emitted()).toHaveProperty("update:modelValue");
  expect(wrapper.emitted<[string]>("update:modelValue")?.[0][0]).to.deep.equal({ hour: 18, minute: 15 });
});

test("it should have the correct text", () => {
  expect(wrapper.find('label').text()).toBe("Test");
});

test("it should have the correct id", () => {
  expect(wrapper.find('input').attributes("id")).toBe("test");
});

test("its value should change when the time is changed", async () => {
  await wrapper.setProps({ modelValue: { hour: 18, minute: 15 } });
  expect(wrapper.find('input').element.value).toBe("18:15");
});