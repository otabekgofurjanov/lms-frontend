<script setup lang="ts">
import type { ProgressStatus } from '@/app/types/progress';

defineProps<{ status: ProgressStatus }>();
</script>

<template>
  <el-tag :type="status === 'COMPLETED' ? 'success' : 'warning'">{{ status }}</el-tag>
</template>
