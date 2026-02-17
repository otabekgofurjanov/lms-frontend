<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

import { examApi } from '@/app/api/exam.api';
import type { AttemptHistoryItem } from '@/app/types/exam';
import { notifyError } from '@/utils/notify';

const route = useRoute();
const quizId = Number(route.params.quizId);
const courseId = Number(route.query.courseId ?? 0);

const loading = ref(false);
const items = ref<AttemptHistoryItem[]>([]);

const load = async (): Promise<void> => {
  loading.value = true;
  try {
    items.value = await examApi.listAttemptHistory(quizId);
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load attempts');
  } finally {
    loading.value = false;
  }
};

await load();
</script>

<template>
  <section>
    <el-button style="margin-bottom: 12px" @click="$router.push(`/student/courses/${courseId}/quizzes`)">Back to quizzes</el-button>
    <el-card>
      <el-table v-loading="loading" :data="items" border>
        <el-table-column prop="attemptNo" label="#" width="80" />
        <el-table-column prop="scorePct" label="Score %" width="120" />
        <el-table-column label="Passed" width="100">
          <template #default="{ row }">
            <el-tag :type="row.passed ? 'success' : 'danger'">{{ row.passed ? 'YES' : 'NO' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Started" min-width="180">
          <template #default="{ row }">{{ dayjs(row.startedAt).format('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="Finished" min-width="180">
          <template #default="{ row }">{{ row.finishedAt ? dayjs(row.finishedAt).format('YYYY-MM-DD HH:mm') : '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="Status" min-width="120" />
      </el-table>
    </el-card>
  </section>
</template>
