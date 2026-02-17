<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { coursesApi } from '@/app/api/courses.api';
import type { CourseListItem } from '@/app/types/courses';
import { notifyError } from '@/utils/notify';

const router = useRouter();
const loading = ref(false);
const courses = ref<CourseListItem[]>([]);

const loadCourses = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await coursesApi.listCourses({ page: 0, size: 100 });
    courses.value = response.items;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load courses');
  } finally {
    loading.value = false;
  }
};

const openEnrollments = async (courseId: number): Promise<void> => {
  await router.push(`/admin/courses/${courseId}/enrollments`);
};

await loadCourses();
</script>

<template>
  <section>
    <h2>Enrollments</h2>
    <el-card>
      <el-table v-loading="loading" :data="courses">
        <el-table-column prop="title" label="Course" />
        <el-table-column prop="status" label="Status" width="120" />
        <el-table-column label="Actions" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEnrollments(row.id)">Manage enrollments</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </section>
</template>
