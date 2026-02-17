<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import { examApi } from '@/app/api/exam.api';
import type { CreateQuizRequest, QuizAdmin, UpdateQuizRequest } from '@/app/types/exam';
import { notifyError, notifySuccess } from '@/utils/notify';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    courseId: number;
    quiz?: QuizAdmin;
  }>(),
  { quiz: undefined },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<CreateQuizRequest>({
  courseId: props.courseId,
  lessonId: null,
  title: '',
  timeLimitSec: null,
  maxAttempts: 1,
  passScorePct: 60,
  isActive: true,
});

const isEdit = computed(() => props.mode === 'edit');

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) return;

    form.courseId = props.courseId;

    if (isEdit.value && props.quiz) {
      form.lessonId = props.quiz.lessonId ?? null;
      form.title = props.quiz.title;
      form.timeLimitSec = props.quiz.timeLimitSec ?? null;
      form.maxAttempts = props.quiz.maxAttempts;
      form.passScorePct = props.quiz.passScorePct;
      form.isActive = props.quiz.isActive;
      return;
    }

    form.lessonId = null;
    form.title = '';
    form.timeLimitSec = null;
    form.maxAttempts = 1;
    form.passScorePct = 60;
    form.isActive = true;
  },
);

const rules: FormRules<CreateQuizRequest> = {
  courseId: [],
  lessonId: [],
  title: [{ required: true, message: 'Title is required', trigger: 'blur' }],
  timeLimitSec: [],
  maxAttempts: [
    {
      validator: (_rule, value: number, callback) => {
        if (value < 1 || value > 10) callback(new Error('Max attempts must be between 1 and 10'));
        else callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  passScorePct: [
    {
      validator: (_rule, value: number, callback) => {
        if (value < 0 || value > 100) callback(new Error('Pass score must be between 0 and 100'));
        else callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  isActive: [],
};

const close = (): void => emit('update:modelValue', false);

const submit = async (): Promise<void> => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const payload: CreateQuizRequest | UpdateQuizRequest = {
      courseId: props.courseId,
      lessonId: form.lessonId,
      title: form.title,
      timeLimitSec: form.timeLimitSec,
      maxAttempts: form.maxAttempts,
      passScorePct: form.passScorePct,
      isActive: form.isActive,
    };

    if (isEdit.value && props.quiz) {
      await examApi.updateQuiz(props.quiz.id, payload);
      notifySuccess('Quiz updated');
    } else {
      await examApi.createQuiz(payload);
      notifySuccess('Quiz created');
    }

    emit('success');
    close();
  } catch (error) {
    notifyError((error as Error).message || 'Quiz operation failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="isEdit ? 'Edit quiz' : 'Create quiz'" width="560px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Title" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="Lesson ID (optional)" prop="lessonId">
        <el-input-number v-model="form.lessonId" :min="1" />
      </el-form-item>
      <el-form-item label="Time limit (sec, optional)" prop="timeLimitSec">
        <el-input-number v-model="form.timeLimitSec" :min="30" :step="30" />
      </el-form-item>
      <el-form-item label="Max attempts" prop="maxAttempts">
        <el-input-number v-model="form.maxAttempts" :min="1" :max="10" />
      </el-form-item>
      <el-form-item label="Pass score %" prop="passScorePct">
        <el-input-number v-model="form.passScorePct" :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="Active" prop="isActive">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-space>
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="submit">Save</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>
