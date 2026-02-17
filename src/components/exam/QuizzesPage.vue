<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import QuizFormDialog from '@/components/exam/QuizFormDialog.vue';
import { examApi } from '@/app/api/exam.api';
import type { QuizAdmin } from '@/app/types/exam';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);
const rolePrefix = route.path.startsWith('/admin') ? 'admin' : 'teacher';

const query = reactive({ page: 0, size: 10 });
const loading = ref(false);
const items = ref<QuizAdmin[]>([]);
const total = ref(0);

const dialogOpen = ref(false);
const mode = ref<'create' | 'edit'>('create');
const active = ref<QuizAdmin | undefined>(undefined);

const loadQuizzes = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await examApi.listQuizzes({ courseId, page: query.page, size: query.size });
    items.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load quizzes');
  } finally {
    loading.value = false;
  }
};

const openCreate = (): void => {
  mode.value = 'create';
  active.value = undefined;
  dialogOpen.value = true;
};

const openEdit = (quiz: QuizAdmin): void => {
  mode.value = 'edit';
  active.value = quiz;
  dialogOpen.value = true;
};

const openBuilder = async (quizId: number): Promise<void> => {
  await router.push(`/${rolePrefix}/courses/${courseId}/exam/quizzes/${quizId}`);
};

const removeQuiz = async (quizId: number): Promise<void> => {
  try {
    await examApi.deleteQuiz(quizId);
    notifySuccess('Quiz deleted');
    await loadQuizzes();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to delete quiz');
  }
};

await loadQuizzes();
</script>

<template>
  <section>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
      <h2>Quizzes</h2>
      <el-button type="primary" @click="openCreate">Create quiz</el-button>
    </div>

    <el-card>
      <el-table v-loading="loading" :data="items" border>
        <el-table-column prop="title" label="Title" min-width="240" />
        <el-table-column prop="lessonId" label="Lesson ID" width="100" />
        <el-table-column label="Active" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? 'YES' : 'NO' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="maxAttempts" label="Max attempts" width="120" />
        <el-table-column prop="passScorePct" label="Pass %" width="100" />
        <el-table-column label="Actions" min-width="220">
          <template #default="{ row }">
            <el-space>
              <el-button link type="primary" @click="openBuilder(row.id)">Open builder</el-button>
              <el-button link type="primary" @click="openEdit(row)">Edit</el-button>
              <el-button link type="danger" @click="removeQuiz(row.id)">Delete</el-button>
            </el-space>
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
          @current-change="(v) => ((query.page = v - 1), loadQuizzes())"
          @size-change="(v) => ((query.size = v), (query.page = 0), loadQuizzes())"
        />
      </div>
    </el-card>

    <QuizFormDialog v-model="dialogOpen" :mode="mode" :course-id="courseId" :quiz="active" @success="loadQuizzes" />
  </section>
</template>
