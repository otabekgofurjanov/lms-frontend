<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { attendanceApi } from '@/app/api/attendance.api';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);

const meetingId = ref<number | null>(null);
const loadingCourse = ref(false);
const loadingMeeting = ref(false);

const recalcCourse = async (): Promise<void> => {
  loadingCourse.value = true;
  try {
    await attendanceApi.adminRecalcCourse(courseId);
    notifySuccess('Course attendance recalculation requested');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to recalculate course attendance');
  } finally {
    loadingCourse.value = false;
  }
};

const recalcMeeting = async (): Promise<void> => {
  if (!meetingId.value) {
    notifyError('Meeting ID is required');
    return;
  }

  loadingMeeting.value = true;
  try {
    await attendanceApi.adminRecalcMeeting(meetingId.value);
    notifySuccess('Meeting attendance recalculation requested');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to recalculate meeting attendance');
  } finally {
    loadingMeeting.value = false;
  }
};
</script>

<template>
  <section class="ops-page">
    <h2>Attendance Operations</h2>
    <el-card shadow="never">
      <template #header>Course operations</template>
      <el-button type="primary" :loading="loadingCourse" @click="recalcCourse">
        Recalculate course attendance
      </el-button>
    </el-card>

    <el-card shadow="never">
      <template #header>Meeting operations</template>
      <el-space>
        <el-input-number v-model="meetingId" :min="1" placeholder="Meeting ID" />
        <el-button type="primary" :loading="loadingMeeting" @click="recalcMeeting">
          Recalculate meeting attendance
        </el-button>
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
