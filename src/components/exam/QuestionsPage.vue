<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

import QuestionFormDialog from '@/components/exam/QuestionFormDialog.vue';
import { examApi } from '@/app/api/exam.api';
import type { QuestionAdmin } from '@/app/types/exam';
import { notifyError, notifySuccess } from '@/utils/notify';

const query = reactive({ page: 0, size: 10, search: '' });
const loading = ref(false);
const items = ref<QuestionAdmin[]>([]);
const total = ref(0);

const dialogOpen = ref(false);
const mode = ref<'create' | 'edit'>('create');
const active = ref<QuestionAdmin | undefined>(undefined);

const loadQuestions = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await examApi.listQuestions({
      page: query.page,
      size: query.size,
      search: query.search || undefined,
    });
    items.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load questions');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadQuestions();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

const openCreate = (): void => {
  mode.value = 'create';
  active.value = undefined;
  dialogOpen.value = true;
};

const openEdit = (question: QuestionAdmin): void => {
  mode.value = 'edit';
  active.value = question;
  dialogOpen.value = true;
};

const remove = async (question: QuestionAdmin): Promise<void> => {
  try {
    await ElMessageBox.confirm('Delete this question?', 'Confirm', { type: 'warning' });
    await examApi.deleteQuestion(question.id);
    notifySuccess('Question deleted');
    await loadQuestions();
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 409) {
      notifyError('Question quizda ishlatilgan');
      return;
    }
  }
};

await loadQuestions();
</script>

<template>
  <section>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
      <h2>Question Bank</h2>
      <el-button type="primary" @click="openCreate">Create question</el-button>
    </div>

    <el-card>
      <el-input v-model="query.search" clearable placeholder="Search question" style="max-width: 320px; margin-bottom: 12px" />
      <el-table v-loading="loading" :data="items" border>
        <el-table-column prop="text" label="Question" min-width="380" />
        <el-table-column label="Options" width="120">
          <template #default="{ row }">{{ row.options.length }}</template>
        </el-table-column>
        <el-table-column label="Created" width="180">
          <template #default="{ row }">{{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="160">
          <template #default="{ row }">
            <el-space>
              <el-button link type="primary" @click="openEdit(row)">Edit</el-button>
              <el-button link type="danger" @click="remove(row)">Delete</el-button>
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
          @current-change="(v) => ((query.page = v - 1), loadQuestions())"
          @size-change="(v) => ((query.size = v), (query.page = 0), loadQuestions())"
        />
      </div>
    </el-card>

    <QuestionFormDialog v-model="dialogOpen" :mode="mode" :question="active" @success="loadQuestions" />
  </section>
</template>
