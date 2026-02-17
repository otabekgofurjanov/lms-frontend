<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AttendancePctTag from '@/components/attendance/AttendancePctTag.vue';
import { attendanceApi } from '@/app/api/attendance.api';
import type { StudentAttendanceResponse } from '@/app/types/attendance';
import { formatDurationMmSs } from '@/utils/duration';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const loading = ref(false);
const data = ref<StudentAttendanceResponse | null>(null);

const loadAttendance = async (): Promise<void> => {
  loading.value = true;
  try {
    data.value = await attendanceApi.studentCourseAttendance(courseId);
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError('Access denied for attendance report');
      await router.push('/student/courses');
      return;
    }

    notifyError((error as Error).message || 'Failed to load attendance report');
  } finally {
    loading.value = false;
  }
};

await loadAttendance();
</script>

<template>
  <section>
    <el-button style="margin-bottom: 12px" @click="$router.push(`/student/courses/${courseId}`)">Back</el-button>
    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="data">
      <el-card style="margin-bottom: 12px" shadow="never">
        <template #header>Attendance summary</template>
        <AttendancePctTag :pct="data.attendancePct" />
      </el-card>

      <el-card shadow="never">
        <el-table :data="data.meetings" border>
          <el-table-column prop="lessonTitle" label="Lesson" min-width="220" />
          <el-table-column label="Status" width="140">
            <template #default="{ row }">
              <el-tag :type="row.status === 'PRESENT' ? 'success' : row.status === 'LATE' ? 'warning' : 'danger'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Duration" width="120">
            <template #default="{ row }">{{ formatDurationMmSs(row.durationSeconds) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </section>
</template>
