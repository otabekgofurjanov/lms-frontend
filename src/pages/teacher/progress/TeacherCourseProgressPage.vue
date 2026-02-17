<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

import StatusTag from '@/components/progress/StatusTag.vue';
import { progressApi } from '@/app/api/progress.api';
import type { TeacherStudentProgressRow } from '@/app/types/progress';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const query = reactive({ page: 0, size: 10, search: '' });
const loading = ref(false);
const rows = ref<TeacherStudentProgressRow[]>([]);
const total = ref(0);

const filteredRows = computed(() => {
  if (!query.search.trim()) return rows.value;
  const needle = query.search.toLowerCase();
  return rows.value.filter((row) => row.fullName.toLowerCase().includes(needle));
});

const load = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await progressApi.teacherCourseProgress(courseId, {
      page: query.page,
      size: query.size,
      search: query.search || undefined,
    });
    rows.value = response.students;
    total.value = response.total;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      await router.push('/forbidden');
      return;
    }
    notifyError((error as Error).message || 'Failed to load progress report');
  } finally {
    loading.value = false;
  }
};

const debounced = useDebounceFn(async () => {
  query.page = 0;
  await load();
}, 400);

watch(
  () => query.search,
  async () => {
    await debounced();
  },
);

await load();
</script>

<template>
  <section>
    <h2>Course Progress Report</h2>
    <el-card>
      <el-input v-model="query.search" clearable placeholder="Search student" style="max-width: 320px; margin-bottom: 12px" />
      <el-table v-loading="loading" :data="filteredRows" border>
        <el-table-column prop="fullName" label="Student" min-width="220" />
        <el-table-column prop="attendancePct" label="Attendance %" width="120" />
        <el-table-column prop="videoCompletionPct" label="Video %" width="120" />
        <el-table-column prop="bestTestScorePct" label="Best test %" width="120" />
        <el-table-column label="Status" width="130">
          <template #default="{ row }">
            <StatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Completed at" min-width="180">
          <template #default="{ row }">{{ row.completedAt ? dayjs(row.completedAt).format('YYYY-MM-DD HH:mm') : '-' }}</template>
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
          @current-change="(v) => ((query.page = v - 1), load())"
          @size-change="(v) => ((query.size = v), (query.page = 0), load())"
        />
      </div>
    </el-card>
  </section>
</template>
