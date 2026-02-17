<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { examApi } from '@/app/api/exam.api';
import type { StudentQuizListItem } from '@/app/types/exam';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const loading = ref(false);
const items = ref<StudentQuizListItem[]>([]);

const loadQuizzes = async (): Promise<void> => {
  loading.value = true;
  try {
    items.value = await examApi.listStudentQuizzes(courseId);
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load quizzes');
  } finally {
    loading.value = false;
  }
};

const startQuiz = async (quizId: number): Promise<void> => {
  await router.push(`/student/quizzes/${quizId}/start?courseId=${courseId}`);
};

const openAttempts = async (quizId: number): Promise<void> => {
  await router.push(`/student/quizzes/${quizId}/attempts?courseId=${courseId}`);
};

await loadQuizzes();
</script>

<template>
  <section>
    <h2>Quizzes</h2>
    <el-skeleton v-if="loading" :rows="6" animated />

    <el-empty v-else-if="items.length === 0" description="No quizzes found" />

    <el-row v-else :gutter="12">
      <el-col v-for="quiz in items" :key="quiz.quizId" :span="8">
        <el-card shadow="hover" class="quiz-card">
          <h3>{{ quiz.title }}</h3>
          <p>Attempts: {{ quiz.attemptsUsed }}/{{ quiz.maxAttempts }}</p>
          <p>Pass: {{ quiz.passScorePct }}%</p>
          <el-space>
            <el-button :disabled="!quiz.canStart" type="primary" @click="startQuiz(quiz.quizId)">Start</el-button>
            <el-button @click="openAttempts(quiz.quizId)">Attempts</el-button>
            <el-tooltip v-if="!quiz.canStart" content="Videoni yakunlang" placement="top">
              <el-tag type="warning">Locked</el-tag>
            </el-tooltip>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.quiz-card {
  margin-bottom: 12px;
}
</style>
