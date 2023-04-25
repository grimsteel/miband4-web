import { type VueWrapper, mount } from "@vue/test-utils";
import Alarms from "../../src/components/band-detail/Alarms.vue";
import { Weekday, type Alarm, type Time } from "../../src/types";
import { faker } from "@faker-js/faker";
import { getRepetitionDescriptiveText } from "../../src/utils";

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
  wrapper = mount(Alarms, {
    props: {
      loading: false,
      alarms: initialAlarms
    }
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