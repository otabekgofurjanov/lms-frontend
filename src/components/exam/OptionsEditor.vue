<script setup lang="ts">
const props = defineProps<{
  options: string[];
}>();

const emit = defineEmits<{
  update: [options: string[]];
}>();

const updateOption = (index: number, value: string): void => {
  const next = [...props.options];
  next[index] = value;
  emit('update', next);
};

const addOption = (): void => {
  emit('update', [...props.options, '']);
};

const removeOption = (index: number): void => {
  if (props.options.length <= 2) return;
  emit(
    'update',
    props.options.filter((_, idx) => idx !== index),
  );
};
</script>

<template>
  <el-space direction="vertical" fill style="width: 100%">
    <div v-for="(option, idx) in options" :key="idx" class="option-row">
      <el-input :model-value="option" :placeholder="`Option ${idx + 1}`" @update:model-value="(v) => updateOption(idx, String(v))" />
      <el-button :disabled="options.length <= 2" @click="removeOption(idx)">Remove</el-button>
    </div>
    <el-button @click="addOption">Add option</el-button>
  </el-space>
</template>

<style scoped>
.option-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
</style>
