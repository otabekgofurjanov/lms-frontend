<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { examApi } from '@/app/api/exam.api';
import type { AttemptHistoryItem } from '@/app/types/exam';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const quizId = Number(route.params.quizId);
const attemptId = Number(route.params.attemptId);
const courseId = Number(route.query.courseId ?? 0);

const latest = ref<AttemptHistoryItem | null>(null);

const load = async (): Promise<void> => {
  try {
    const history = await examApi.listAttemptHistory(quizId);
    latest.value = history.find((item) => item.attemptNo === attemptId) ?? history[0] ?? null;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load result');
  }
};

await load();
</script>

<template>
  <section>
    <h2>Quiz Result</h2>
    <el-card v-if="latest" shadow="never">
      <el-statistic title="Score" :value="latest.scorePct" suffix="%" />
      <el-tag :type="latest.passed ? 'success' : 'danger'" style="margin-top: 8px">
        {{ latest.passed ? 'PASSED' : 'FAILED' }}
      </el-tag>
      <div style="margin-top: 12px">
        <el-button @click="$router.push(`/student/courses/${courseId}/quizzes`)">Back to quizzes</el-button>
        <el-button type="primary" @click="$router.push(`/student/quizzes/${quizId}/attempts?courseId=${courseId}`)">
          View attempts
        </el-button>
      </div>
    </el-card>
    <el-empty v-else description="Result not found" />
  </section>
</template>
