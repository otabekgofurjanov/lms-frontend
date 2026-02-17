<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

import { examApi } from '@/app/api/exam.api';
import type { StudentQuizAttempt, SubmitAttemptRequest, StudentQuizResult } from '@/app/types/exam';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const router = useRouter();

const quizId = Number(route.params.quizId);
const courseId = Number(route.query.courseId ?? 0);

const loading = ref(false);
const submitting = ref(false);
const attempt = ref<StudentQuizAttempt | null>(null);
const answers = reactive<Record<number, number | null>>({});

const remainingSeconds = ref<number | null>(null);
let timer: number | null = null;

const answeredCount = computed(() => Object.values(answers).filter((value) => value !== null).length);
const totalQuestions = computed(() => attempt.value?.questions.length ?? 0);

const stopTimer = (): void => {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
};

const submit = async (forced = false): Promise<void> => {
  if (!attempt.value) return;
  if (submitting.value) return;

  if (!forced) {
    try {
      await ElMessageBox.confirm('Submit test?', 'Confirm', { type: 'warning' });
    } catch {
      return;
    }
  }

  submitting.value = true;
  try {
    const payload: SubmitAttemptRequest = {
      answers: attempt.value.questions.map((question) => ({
        questionId: question.questionId,
        selectedIndex: answers[question.questionId] ?? null,
      })),
    };

    const result: StudentQuizResult = await examApi.submitAttempt(attempt.value.attemptId, payload);
    await router.push(`/student/quizzes/${quizId}/result/${result.attemptId}?courseId=${courseId}`);
  } catch (error) {
    notifyError((error as Error).message || 'Failed to submit attempt');
  } finally {
    submitting.value = false;
  }
};

const startTimer = (seconds: number): void => {
  remainingSeconds.value = seconds;
  stopTimer();

  timer = window.setInterval(async () => {
    if (remainingSeconds.value === null) return;
    remainingSeconds.value -= 1;

    if (remainingSeconds.value <= 0) {
      stopTimer();
      await submit(true);
    }
  }, 1000);
};

const loadAttempt = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await examApi.startQuiz(quizId);
    attempt.value = response;

    response.questions.forEach((question) => {
      answers[question.questionId] = null;
    });

    if (response.timeLimitSec && response.timeLimitSec > 0) {
      startTimer(response.timeLimitSec);
    }
  } catch (error) {
    notifyError((error as Error).message || 'Cannot start quiz');
    await router.push(`/student/courses/${courseId}/quizzes`);
  } finally {
    loading.value = false;
  }
};

onBeforeUnmount(() => {
  stopTimer();
});

await loadAttempt();
</script>

<template>
  <section>
    <h2>Quiz attempt</h2>
    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="attempt">
      <el-card shadow="never" style="margin-bottom: 12px">
        <el-space>
          <el-tag>{{ answeredCount }}/{{ totalQuestions }} answered</el-tag>
          <el-tag v-if="remainingSeconds !== null" type="warning">{{ remainingSeconds }}s left</el-tag>
        </el-space>
      </el-card>

      <el-card v-for="(question, idx) in attempt.questions" :key="question.questionId" class="question-card" shadow="never">
        <p><strong>{{ idx + 1 }}. {{ question.text }}</strong></p>
        <el-radio-group v-model="answers[question.questionId]">
          <el-space direction="vertical" fill>
            <el-radio v-for="(option, optionIdx) in question.options" :key="optionIdx" :value="optionIdx">
              {{ option }}
            </el-radio>
          </el-space>
        </el-radio-group>
      </el-card>

      <el-button type="primary" :loading="submitting" @click="submit">Submit attempt</el-button>
    </template>
  </section>
</template>

<style scoped>
.question-card {
  margin-bottom: 12px;
}
</style>
