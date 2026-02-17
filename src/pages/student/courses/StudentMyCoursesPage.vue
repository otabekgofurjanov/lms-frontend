<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

import { enrollmentApi } from '@/app/api/enrollment.api';
import type { StudentCourseListItem } from '@/app/types/enrollment';
import { notifyError } from '@/utils/notify';

const router = useRouter();
const query = reactive({ page: 0, size: 12 });
const loading = ref(false);
const total = ref(0);
const items = ref<StudentCourseListItem[]>([]);

const loadCourses = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await enrollmentApi.studentMyCourses(query);
    items.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load courses');
  } finally {
    loading.value = false;
  }
};

const openCourse = async (courseId: number): Promise<void> => {
  await router.push(`/student/courses/${courseId}`);
};

const openAttendance = async (courseId: number): Promise<void> => {
  await router.push(`/student/courses/${courseId}/attendance`);
};

await loadCourses();
</script>

<template>
  <section>
    <h2>My Courses</h2>
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="items.length === 0" description="No enrolled courses" />

    <el-row v-else :gutter="16">
      <el-col v-for="course in items" :key="course.courseId" :span="8">
        <el-card class="course-card" shadow="hover">
          <img v-if="course.coverUrl" :src="course.coverUrl" class="course-cover" alt="cover" />
          <h3>{{ course.title }}</h3>
          <p>Enrolled at: {{ dayjs(course.enrolledAt).format('YYYY-MM-DD HH:mm') }}</p>
          <el-space>
            <el-button type="primary" @click="openCourse(course.courseId)">Open</el-button>
            <el-button @click="openAttendance(course.courseId)">Attendance</el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <div style="display: flex; justify-content: flex-end; margin-top: 12px">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        :page-size="query.size"
        :current-page="query.page + 1"
        :page-sizes="[6, 12, 24]"
        @current-change="(v) => ((query.page = v - 1), loadCourses())"
        @size-change="(v) => ((query.size = v), (query.page = 0), loadCourses())"
      />
    </div>
  </section>
</template>

<style scoped>
.course-card {
  margin-bottom: 16px;
}

.course-cover {
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
