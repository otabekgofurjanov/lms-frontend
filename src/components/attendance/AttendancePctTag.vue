<script setup lang="ts">
const props = defineProps<{ pct: number }>();

const getType = (value: number): 'success' | 'warning' | 'danger' => {
  if (value >= 80) return 'success';
  if (value >= 50) return 'warning';
  return 'danger';
};
</script>

<template>
  <el-tag :type="getType(props.pct)">{{ props.pct.toFixed(1) }}%</el-tag>
</template>
