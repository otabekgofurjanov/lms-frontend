<script setup lang="ts">
import { computed } from 'vue';

import type { VideoProgressSnapshot } from '@/app/types/video';
import { formatDurationMmSs } from '@/utils/duration';

const props = defineProps<{
  snapshot: VideoProgressSnapshot | null;
  checksumSha256?: string;
  tabSwitchCount: number;
  seekAttemptCount: number;
}>();

const watched = computed(() => formatDurationMmSs(props.snapshot?.watchedSeconds ?? 0));
const total = computed(() => formatDurationMmSs(props.snapshot?.totalSeconds ?? 0));
</script>

<template>
  <el-card shadow="never">
    <template #header>Video status</template>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="Watched">{{ watched }}</el-descriptions-item>
      <el-descriptions-item label="Total">{{ total }}</el-descriptions-item>
      <el-descriptions-item label="Completion">{{ snapshot?.completionPct.toFixed(1) ?? '0.0' }}%</el-descriptions-item>
      <el-descriptions-item label="Checksum">{{ checksumSha256 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Tab switches">{{ tabSwitchCount }}</el-descriptions-item>
      <el-descriptions-item label="Seek attempts">{{ seekAttemptCount }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
