<script setup lang="ts">
defineProps<{
  title: string;
  value: number;
}>();
</script>

<template>
  <el-card shadow="never">
    <el-statistic :title="title" :value="Number(value.toFixed(1))" suffix="%" />
  </el-card>
</template>
