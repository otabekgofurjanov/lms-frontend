<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { enrollmentApi } from '@/app/api/enrollment.api';
import type { StudentCourseDetail } from '@/app/types/enrollment';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const loading = ref(false);
const detail = ref<StudentCourseDetail | null>(null);

const loadDetail = async (): Promise<void> => {
  loading.value = true;
  try {
    detail.value = await enrollmentApi.studentCourseDetail(courseId);
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError('Access denied for this course');
      await router.push('/student/courses');
      return;
    }
    if (status === 404) {
      await router.push('/not-found');
      return;
    }
    notifyError((error as Error).message || 'Failed to load course detail');
  } finally {
    loading.value = false;
  }
};


const openJoin = async (lessonId: number): Promise<void> => {
  await router.push({ path: `/student/lessons/${lessonId}/join`, query: { courseId: String(courseId) } });
};

const openWatch = async (lessonId: number, lessonTitle: string): Promise<void> => {
  await router.push({
    path: `/student/lessons/${lessonId}/video`,
    query: { courseId: String(courseId), lessonTitle },
  });
};

const openAttendance = async (): Promise<void> => {
  await router.push(`/student/courses/${courseId}/attendance`);
};

const openProgress = async (): Promise<void> => {
  await router.push(`/student/courses/${courseId}/progress`);
};

const openQuizzes = async (): Promise<void> => {
  await router.push(`/student/courses/${courseId}/quizzes`);
};

await loadDetail();
</script>

<template>
  <section>
    <el-button style="margin-bottom: 12px" @click="$router.push('/student/courses')">Back</el-button>
    <el-skeleton v-if="loading" :rows="10" animated />
    <el-card v-else-if="detail">
      <el-space>
        <h2>{{ detail.title }}</h2>
        <el-tag>{{ detail.status }}</el-tag>
        <el-button type="primary" link @click="openAttendance">Attendance</el-button>
        <el-button type="primary" link @click="openProgress">Progress</el-button>
        <el-button type="primary" link @click="openQuizzes">Quizzes</el-button>
      </el-space>

      <el-collapse style="margin-top: 16px">
        <el-collapse-item v-for="module in detail.modules" :key="module.id" :title="module.title" :name="module.id">
          <el-space direction="vertical" fill style="width: 100%">
            <div v-for="lesson in module.lessons" :key="lesson.id" class="lesson-row">
              <span>{{ lesson.title }}</span>
              <el-space>
                <el-tag size="small">{{ lesson.lessonType }}</el-tag>
                <el-button
                  v-if="lesson.lessonType === 'LIVE_ZOOM'"
                  type="primary"
                  link
                  @click="openJoin(lesson.id)"
                >
                  Join
                </el-button>
                <el-button
                  v-if="lesson.lessonType === 'RECORDED'"
                  type="primary"
                  link
                  @click="openWatch(lesson.id, lesson.title)"
                >
                  Watch
                </el-button>
              </el-space>
            </div>
          </el-space>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </section>
</template>

<style scoped>
.lesson-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}
</style>
