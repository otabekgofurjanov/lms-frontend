<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

import CertificateCard from '@/components/certificate/CertificateCard.vue';
import ProgressMetricCard from '@/components/progress/ProgressMetricCard.vue';
import StatusTag from '@/components/progress/StatusTag.vue';
import { certificateApi } from '@/app/api/certificate.api';
import { progressApi } from '@/app/api/progress.api';
import type { StudentCertificateResponse } from '@/app/types/certificate';
import type { StudentCourseProgress } from '@/app/types/progress';
import { copyToClipboard } from '@/utils/clipboard';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);

const loading = ref(false);
const progress = ref<StudentCourseProgress | null>(null);
const certificate = ref<StudentCertificateResponse | null>(null);
const certMissing = ref(false);

const hasCompleted = computed(() => progress.value?.status === 'COMPLETED');

const openInNewTab = (url: string): void => window.open(url, '_blank');

const copySerial = async (serial: string): Promise<void> => {
  const ok = await copyToClipboard(serial);
  if (ok) notifySuccess('Serial copied');
  else notifyError('Failed to copy serial');
};

const loadAll = async (): Promise<void> => {
  loading.value = true;
  certMissing.value = false;
  try {
    const [progressRes, certRes] = await Promise.allSettled([
      progressApi.studentCourseProgress(courseId),
      certificateApi.studentCourseCertificate(courseId),
    ]);

    if (progressRes.status === 'fulfilled') {
      progress.value = progressRes.value;
    } else {
      throw progressRes.reason;
    }

    if (certRes.status === 'fulfilled') {
      certificate.value = certRes.value;
    } else {
      const status = (certRes.reason as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        certMissing.value = true;
      } else {
        notifyError((certRes.reason as Error).message || 'Certificate loading failed');
      }
    }
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load progress');
  } finally {
    loading.value = false;
  }
};

await loadAll();
</script>

<template>
  <section class="progress-page">
    <div class="progress-page__header">
      <h2>Course Progress</h2>
      <el-button @click="loadAll">Refresh</el-button>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />
    <template v-else-if="progress">
      <el-row :gutter="12">
        <el-col :span="8"><ProgressMetricCard title="Attendance" :value="progress.attendancePct" /></el-col>
        <el-col :span="8"><ProgressMetricCard title="Video completion" :value="progress.videoCompletionPct" /></el-col>
        <el-col :span="8"><ProgressMetricCard title="Best test score" :value="progress.bestTestScorePct" /></el-col>
      </el-row>

      <el-card shadow="never" style="margin-top: 12px">
        <el-space>
          <StatusTag :status="progress.status" />
          <span v-if="progress.completedAt">Completed at: {{ dayjs(progress.completedAt).format('YYYY-MM-DD HH:mm') }}</span>
        </el-space>
        <el-descriptions :column="3" border style="margin-top: 12px">
          <el-descriptions-item label="Min attendance">{{ progress.rules.minAttendancePct }}%</el-descriptions-item>
          <el-descriptions-item label="Min video">{{ progress.rules.minVideoPct }}%</el-descriptions-item>
          <el-descriptions-item label="Min test score">{{ progress.rules.minTestScorePct }}%</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <CertificateCard
        v-if="certificate"
        :cert="certificate"
        style="margin-top: 12px"
        @download="openInNewTab"
        @verify="openInNewTab"
        @copy="copySerial"
      />

      <el-alert
        v-else-if="hasCompleted && certMissing"
        title="Certificate generating... Please refresh shortly."
        type="info"
        :closable="false"
        style="margin-top: 12px"
      />
    </template>
  </section>
</template>

<style scoped>
.progress-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
