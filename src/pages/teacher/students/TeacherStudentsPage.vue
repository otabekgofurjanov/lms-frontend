<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

import { enrollmentApi } from '@/app/api/enrollment.api';
import type { EnrollmentListItem } from '@/app/types/enrollment';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);

const query = reactive({ page: 0, size: 10, search: '' });
const loading = ref(false);
const rows = ref<EnrollmentListItem[]>([]);
const total = ref(0);

const loadStudents = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await enrollmentApi.teacherListStudents(courseId, {
      page: query.page,
      size: query.size,
      search: query.search || undefined,
    });
    rows.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load students');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadStudents();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

await loadStudents();
</script>

<template>
  <section>
    <h2>Students of course #{{ courseId }}</h2>
    <el-card>
      <el-input v-model="query.search" placeholder="Search student by name/email" clearable style="max-width: 320px; margin-bottom: 12px" />
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column label="Full name" min-width="220">
          <template #default="{ row }">{{ row.student.fullName }}</template>
        </el-table-column>
        <el-table-column label="Email" min-width="220">
          <template #default="{ row }">{{ row.student.email }}</template>
        </el-table-column>
        <el-table-column label="Enrollment status" min-width="140">
          <template #default="{ row }">
            <el-tag :type="row.enrollmentStatus === 'ACTIVE' ? 'success' : row.enrollmentStatus === 'PAUSED' ? 'warning' : 'info'">
              {{ row.enrollmentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Enrolled at" min-width="180">
          <template #default="{ row }">{{ dayjs(row.enrolledAt).format('YYYY-MM-DD HH:mm') }}</template>
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
          @current-change="(v) => ((query.page = v - 1), loadStudents())"
          @size-change="(v) => ((query.size = v), (query.page = 0), loadStudents())"
        />
      </div>
    </el-card>
  </section>
</template>
