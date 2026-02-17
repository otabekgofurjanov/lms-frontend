<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';

import ZoomMeetingInfoCard from '@/components/zoom/ZoomMeetingInfoCard.vue';
import { zoomApi } from '@/app/api/zoom.api';
import type { ZoomMeetingCreateRequest, ZoomMeetingResponse } from '@/app/types/zoom';
import { copyToClipboard } from '@/utils/clipboard';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const lessonId = Number(route.params.lessonId);

const loading = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const meeting = ref<ZoomMeetingResponse | null>(null);
const connected = ref(false);

const form = reactive<ZoomMeetingCreateRequest>({
  startTime: '',
  durationMinutes: 60,
  topic: '',
});

const rules: FormRules<ZoomMeetingCreateRequest> = {
  startTime: [{ required: true, message: 'Start time is required', trigger: 'change' }],
  durationMinutes: [
    { required: true, message: 'Duration is required', trigger: 'blur' },
    {
      validator: (_rule, value: number, callback) => {
        if (value < 15 || value > 600) callback(new Error('Duration must be between 15 and 600 minutes'));
        else callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
};

const loadMeeting = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await zoomApi.getLessonZoomMeeting(lessonId);
    meeting.value = response;
    connected.value = Boolean(response);
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError('Access denied for this lesson');
      await router.push('/forbidden');
      return;
    }
    notifyError((error as Error).message || 'Failed to load meeting');
  } finally {
    loading.value = false;
  }
};

const connectZoom = async (): Promise<void> => {
  try {
    const response = await zoomApi.getConnectUrl();
    window.open(response.url, '_blank');
    connected.value = true;
    notifySuccess('Zoom connect URL opened in new tab');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to open Zoom connect URL');
  }
};

const disconnectZoom = async (): Promise<void> => {
  try {
    await zoomApi.disconnectZoom();
    connected.value = false;
    notifySuccess('Zoom disconnected');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to disconnect Zoom');
  }
};

const createMeeting = async (): Promise<void> => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    meeting.value = await zoomApi.createLessonZoomMeeting(lessonId, {
      startTime: form.startTime,
      durationMinutes: form.durationMinutes,
      topic: form.topic || undefined,
    });
    notifySuccess('Zoom meeting created');
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError('You do not have access to schedule this lesson');
      await router.push('/forbidden');
      return;
    }
    notifyError((error as Error).message || 'Failed to create meeting');
  } finally {
    submitting.value = false;
  }
};

const openLink = (url: string): void => {
  window.open(url, '_blank');
};

const copyLink = async (url: string): Promise<void> => {
  const copied = await copyToClipboard(url);
  if (copied) notifySuccess('Link copied');
  else notifyError('Failed to copy link');
};

await loadMeeting();
</script>

<template>
  <section class="zoom-page">
    <h2>Lesson Zoom</h2>

    <el-card shadow="never">
      <template #header>Zoom connection</template>
      <el-alert type="info" :closable="false" show-icon>
        <template #title>After authorizing Zoom in new tab, come back and refresh this page.</template>
      </el-alert>
      <el-space style="margin-top: 12px">
        <el-tag :type="connected ? 'success' : 'info'">{{ connected ? 'Connected' : 'Disconnected' }}</el-tag>
        <el-button type="primary" @click="connectZoom">Connect Zoom</el-button>
        <el-button @click="disconnectZoom">Disconnect</el-button>
      </el-space>
    </el-card>

    <el-skeleton v-if="loading" :rows="6" animated />
    <ZoomMeetingInfoCard v-else-if="meeting" :meeting="meeting" @copy="copyLink" @open="openLink" />

    <el-card v-else shadow="never">
      <template #header>Create meeting</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Start time" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Duration (minutes)" prop="durationMinutes">
          <el-input-number v-model="form.durationMinutes" :min="15" :max="600" />
        </el-form-item>
        <el-form-item label="Topic" prop="topic">
          <el-input v-model="form.topic" placeholder="Optional topic" />
        </el-form-item>
        <el-button type="primary" :loading="submitting" @click="createMeeting">Create meeting</el-button>
      </el-form>
    </el-card>
  </section>
</template>

<style scoped>
.zoom-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
