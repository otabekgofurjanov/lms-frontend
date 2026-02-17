<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';

import { certificateApi } from '@/app/api/certificate.api';
import { progressApi } from '@/app/api/progress.api';
import type { RecalcProgressResponse } from '@/app/types/progress';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);

const loadingRecalc = ref(false);
const loadingRevoke = ref(false);
const serial = ref('');
const result = ref<RecalcProgressResponse | null>(null);

const recalc = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('Recalculate course progress?', 'Confirm', { type: 'warning' });
  } catch {
    return;
  }

  loadingRecalc.value = true;
  try {
    result.value = await progressApi.adminRecalculateProgress(courseId);
    notifySuccess('Progress recalculation completed');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to recalculate progress');
  } finally {
    loadingRecalc.value = false;
  }
};

const revoke = async (): Promise<void> => {
  if (!serial.value.trim()) {
    notifyError('Serial is required');
    return;
  }

  try {
    await ElMessageBox.confirm('Revoke this certificate?', 'Confirm', { type: 'warning' });
  } catch {
    return;
  }

  loadingRevoke.value = true;
  try {
    await certificateApi.adminRevokeCertificate(serial.value.trim());
    notifySuccess('Certificate revoked');
    serial.value = '';
  } catch (error) {
    notifyError((error as Error).message || 'Failed to revoke certificate');
  } finally {
    loadingRevoke.value = false;
  }
};
</script>

<template>
  <section class="ops-page">
    <h2>Progress Operations</h2>

    <el-card shadow="never">
      <template #header>Recalculate course progress</template>
      <el-button type="primary" :loading="loadingRecalc" @click="recalc">Recalculate Progress</el-button>

      <el-alert
        v-if="result"
        style="margin-top: 12px"
        type="success"
        :closable="false"
        :title="`Total: ${result.total}, Completed: ${result.updatedCompleted}, In progress: ${result.updatedInProgress}`"
      />
    </el-card>

    <el-card shadow="never">
      <template #header>Revoke certificate</template>
      <el-space>
        <el-input v-model="serial" placeholder="Enter certificate serial" style="width: 280px" />
        <el-button type="danger" :loading="loadingRevoke" @click="revoke">Revoke</el-button>
      </el-space>
    </el-card>
  </section>
</template>

<style scoped>
.ops-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
