<script setup lang="ts">
import dayjs from 'dayjs';

import type { ZoomMeetingResponse } from '@/app/types/zoom';

defineProps<{ meeting: ZoomMeetingResponse }>();

const emit = defineEmits<{
  copy: [url: string];
  open: [url: string];
}>();
</script>

<template>
  <el-card shadow="never">
    <template #header>Meeting details</template>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="Status">
        <el-tag :type="meeting.status === 'LIVE' ? 'success' : meeting.status === 'ENDED' ? 'info' : 'warning'">
          {{ meeting.status }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Start time">{{ dayjs(meeting.startTime).format('YYYY-MM-DD HH:mm') }}</el-descriptions-item>
      <el-descriptions-item label="Duration">{{ meeting.durationMinutes }} minutes</el-descriptions-item>
      <el-descriptions-item label="Join URL">{{ meeting.joinUrl }}</el-descriptions-item>
    </el-descriptions>
    <el-space style="margin-top: 12px">
      <el-button @click="emit('copy', meeting.joinUrl)">Copy link</el-button>
      <el-button type="primary" @click="emit('open', meeting.joinUrl)">Open join link</el-button>
    </el-space>
  </el-card>
</template>
