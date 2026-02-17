<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

import AttendanceKpiCard from '@/components/attendance/AttendanceKpiCard.vue';
import AttendancePctTag from '@/components/attendance/AttendancePctTag.vue';
import { attendanceApi } from '@/app/api/attendance.api';
import type { TeacherAttendanceRow } from '@/app/types/attendance';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const query = reactive({ page: 0, size: 10, search: '' });
const loading = ref(false);
const rows = ref<TeacherAttendanceRow[]>([]);
const total = ref(0);
const avgAttendance = ref(0);

const computedAvg = computed(() => {
  if (rows.value.length === 0) return 0;
  const sum = rows.value.reduce((acc, row) => acc + row.attendancePct, 0);
  return sum / rows.value.length;
});

const loadAttendance = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await attendanceApi.teacherCourseAttendance(courseId, {
      page: query.page,
      size: query.size,
      search: query.search || undefined,
    });

    rows.value = response.students;
    total.value = response.total;
    avgAttendance.value = response.meetingsSummary?.averageAttendancePct ?? computedAvg.value;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError('Access denied for this course attendance');
      await router.push('/forbidden');
      return;
    }
    notifyError((error as Error).message || 'Failed to load attendance');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadAttendance();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

await loadAttendance();
</script>

<template>
  <section class="attendance-page">
    <h2>Course Attendance</h2>

    <AttendanceKpiCard title="Average attendance" :value="avgAttendance" />

    <el-card>
      <el-input v-model="query.search" clearable placeholder="Search student" style="max-width: 320px; margin-bottom: 12px" />
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column prop="fullName" label="Student" min-width="220" />
        <el-table-column label="Attendance" width="160">
          <template #default="{ row }">
            <AttendancePctTag :pct="row.attendancePct" />
          </template>
        </el-table-column>
        <el-table-column label="Last meeting status" width="180">
          <template #default="{ row }">
            <el-tag :type="row.lastMeetingStatus === 'PRESENT' ? 'success' : row.lastMeetingStatus === 'LATE' ? 'warning' : 'danger'">
              {{ row.lastMeetingStatus || 'UNKNOWN' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: flex-end; margin-top: 12px">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="query.size"
          :current-page="query.page + 1"
          :page-sizes="[10, 20, 50]"
          @current-change="(v) => ((query.page = v - 1), loadAttendance())"
          @size-change="(v) => ((query.size = v), (query.page = 0), loadAttendance())"
        />
      </div>
    </el-card>
  </section>
</template>

<style scoped>
.attendance-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
