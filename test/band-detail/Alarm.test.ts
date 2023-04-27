import { type VueWrapper, mount, flushPromises } from "@vue/test-utils";
import Alarms from "../../src/components/band-detail/Alarms.vue";
import { Weekday, type Alarm, type Time } from "../../src/types";
import { faker } from "@faker-js/faker";
import { getRepetitionDescriptiveText } from "../../src/utils";
import { nextTick } from "vue";

type DescriptiveTime = Time & { descriptive: string };

function generateTime(): DescriptiveTime {
  const date = faker.date.future();
  return {
    hour: date.getHours(),
    minute: date.getMinutes(),
    descriptive: date.toLocaleTimeString(undefined, { timeStyle: "short" })
  }
}

function generateDays(): Set<Weekday> {
  const numDays = faker.datatype.number({ min: 1, max: 6 });
  const days = faker.helpers.uniqueArray(faker.date.weekday, numDays);
  return new Set(days.map(day => Weekday[day as keyof typeof Weekday]));
}

function generateAlarm(): Alarm & { time: DescriptiveTime } {
  return {
    id: faker.datatype.number(),
    time: generateTime(),
    enabled: true,
    days: generateDays()
  }
}

const initialAlarms: (Alarm & { time: DescriptiveTime })[] = Array.from({ length: 10 }).map(() => generateAlarm());

let wrapper: VueWrapper;
beforeEach(async () => {
  document.body.innerHTML = `<div id="app"></div>`;
  wrapper = mount(Alarms, {
    props: {
      loading: false,
      alarms: initialAlarms
    },
    attachTo: document.getElementById("app")!
  });
});

test("it displays a list of alarms with the correct details", () => {
  const alarms = wrapper.findAll('[data-test="alarm"]');
  expect(alarms).toHaveLength(initialAlarms.length);
  initialAlarms.forEach((alarm, i) => {
    expect(alarms[i].find('[data-test="time"]').text()).toBe(alarm.time.descriptive);
    expect(alarms[i].find('[data-test="days"]').text()).toBe(getRepetitionDescriptiveText(alarm));
  });
});

test("it allows the user to add alarms when less than 0xf alarms exist", async () => {
  expect(wrapper.find('[data-test="add-alarm"]').exists()).toBeTruthy();
  await wrapper.setProps({
    alarms: Array.from({ length: 0xf }).map(() => generateAlarm())
  });
  expect(wrapper.find('[data-test="add-alarm"]').exists()).toBeFalsy();
});

test("it can navigate between screens", async () => {
  await wrapper.find('[data-test="add-alarm"]').trigger("click");
  expect(wrapper.find('[data-test="add-alarm"]').exists()).toBeFalsy();
  expect(wrapper.find("#alarm-time").exists()).toBeTruthy();
  expect(wrapper.find('[data-test="cancel"]').exists()).toBeTruthy();
  await wrapper.find('[data-test="cancel"]').trigger("click");
  expect(wrapper.find('[data-test="add-alarm"]').exists()).toBeTruthy();
  await wrapper.find('[data-test="alarm"]').trigger("click");
  expect(wrapper.find("#alarm-time").exists()).toBeTruthy();
});

test("it can create a new alarm", async () => {
  await wrapper.find('[data-test="add-alarm"]').trigger("click");
  expect(wrapper.find('[data-test="delete"]').exists()).toBeFalsy();
  await wrapper.find('#alarm-time').setValue(65700000);
  wrapper.find(`#weekday-${Weekday.Tuesday}`).trigger("click");
  await wrapper.find(`#weekday-${Weekday.Thursday}`).trigger("click");
  await wrapper.find('[data-test="enabled"] input').trigger("click");
  await wrapper.find('[data-test="save"]').trigger("click");
  expect(wrapper.emitted()).toHaveProperty("save");
  const alarm = wrapper.emitted<[Alarm]>()["save"][0][0];
  expect(alarm.time).toEqual({ hour: 18, minute: 15 });
  expect(alarm.days).to.deep.equal(new Set([0,2,4]));
  expect(alarm.enabled).toBeFalsy();
});

test("it errors when no days are selected", async () => {
  await wrapper.find('[data-test="add-alarm"]').trigger("click");
  for (const wkdy of [Weekday.Monday, Weekday.Tuesday, Weekday.Wednesday, Weekday.Thursday, Weekday.Friday]) {
    await wrapper.find(`#weekday-${wkdy}`).trigger("click");
  }
  expect(wrapper.find('[data-test="no-weekdays-selected"]').exists()).toBeTruthy();
  await wrapper.find('[data-test="save"]').trigger("click");
  expect(wrapper.emitted()).not.toHaveProperty("save");
});

test("it can edit an existing alarm", async () => {
  const editingAlarm = initialAlarms[0];
  await wrapper.find('[data-test="alarm"]').trigger("click");
  expect(wrapper.find<HTMLInputElement>("#alarm-time").element.value).toBe(`${editingAlarm.time.hour.toString().padStart(2, '0')}:${editingAlarm.time.minute.toString().padStart(2, "0")}`);
  
});