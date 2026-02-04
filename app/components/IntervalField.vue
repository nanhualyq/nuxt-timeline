<script setup lang="ts">
const model = defineModel<string>();

const timeUnits = [
  { label: "Seconds", value: "seconds" },
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
  { label: "Weeks", value: "weeks" },
  { label: "Months", value: "months" },
  { label: "Years", value: "years" },
];

const number = ref(1);
const unit = ref("hours");

watch(model, (newVal) => {
  const [, n = 1, u = "hours"] = (newVal || "").match(/^.(\d+) (\w+)/) || [];
  number.value = +n;
  unit.value = u;
});

watch(
  [number, unit],
  (newVal) => {
    model.value = `+${newVal[0]} ${newVal[1]}`;
  },
  { deep: true },
);
</script>

<template>
  <div class="flex gap-2">
    <UInput
      v-model.number="number"
      type="number"
      class="w-24"
      placeholder="1"
      :min="1"
    />
    <USelect
      v-model="unit"
      :items="timeUnits"
      option-attribute="label"
      value-attribute="value"
      class="flex-1"
    />
  </div>
</template>
