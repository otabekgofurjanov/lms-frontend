<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import draggable from 'vuedraggable';

import { examApi } from '@/app/api/exam.api';
import type { QuestionAdmin, QuizAdmin } from '@/app/types/exam';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);
const quizId = Number(route.params.id);

const loading = ref(false);
const questions = ref<QuestionAdmin[]>([]);
const selectedQuestionIds = ref<number[]>([]);
const attached = ref<QuestionAdmin[]>([]);
const quiz = ref<QuizAdmin | null>(null);

const attachedIds = computed(() => attached.value.map((item) => item.id));

const loadData = async (): Promise<void> => {
  loading.value = true;
  try {
    const [questionPage, quizPage] = await Promise.all([
      examApi.listQuestions({ page: 0, size: 200 }),
      examApi.listQuizzes({ courseId, page: 0, size: 200 }),
    ]);

    questions.value = questionPage.items;
    quiz.value = quizPage.items.find((item) => item.id === quizId) ?? null;

    const initialIds = quiz.value?.questionIds ?? [];
    attached.value = initialIds
      .map((id) => questionPage.items.find((question) => question.id === id))
      .filter((item): item is QuestionAdmin => Boolean(item));
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load quiz builder');
  } finally {
    loading.value = false;
  }
};

const attachSelected = async (): Promise<void> => {
  if (selectedQuestionIds.value.length === 0) {
    notifyError('Select at least one question');
    return;
  }

  try {
    await examApi.attachQuestions(quizId, selectedQuestionIds.value);
    selectedQuestionIds.value.forEach((id) => {
      if (!attachedIds.value.includes(id)) {
        const question = questions.value.find((item) => item.id === id);
        if (question) {
          attached.value.push(question);
        }
      }
    });
    notifySuccess('Questions attached');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to attach questions');
  }
};

const onReorder = async (previous: QuestionAdmin[]): Promise<void> => {
  try {
    await examApi.reorderQuizQuestions(
      quizId,
      attached.value.map((item) => item.id),
    );
    notifySuccess('Question order updated');
  } catch (error) {
    attached.value = previous;
    notifyError((error as Error).message || 'Failed to reorder questions');
  }
};

const onBankSelectionChange = (rows: QuestionAdmin[]): void => {
  selectedQuestionIds.value = rows.map((row) => row.id);
};

let previousOrder: QuestionAdmin[] = [];
const onDragStart = (): void => {
  previousOrder = [...attached.value];
};

const onDragEnd = async (): Promise<void> => {
  await onReorder(previousOrder);
};

await loadData();
</script>

<template>
  <section>
    <h2>Quiz Builder: {{ quiz?.title || `#${quizId}` }}</h2>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>Question bank</template>
          <el-table v-loading="loading" :data="questions" height="460" @selection-change="onBankSelectionChange">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="text" label="Question" min-width="280" />
          </el-table>
          <el-button type="primary" style="margin-top: 12px" @click="attachSelected">Add to quiz</el-button>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <el-space>
              <span>Quiz questions</span>
              <el-tag>{{ attached.length }}</el-tag>
            </el-space>
          </template>

          <draggable v-model="attached" item-key="id" handle=".drag" @start="onDragStart" @end="onDragEnd">
            <template #item="{ element }">
              <div class="question-item">
                <span class="drag">⋮⋮</span>
                <span>{{ element.text }}</span>
              </div>
            </template>
          </draggable>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.question-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.drag {
  cursor: move;
  color: #9ca3af;
}
</style>
