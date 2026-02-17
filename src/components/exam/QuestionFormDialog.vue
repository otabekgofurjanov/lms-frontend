<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import OptionsEditor from '@/components/exam/OptionsEditor.vue';
import { examApi } from '@/app/api/exam.api';
import type { CreateQuestionRequest, QuestionAdmin, UpdateQuestionRequest } from '@/app/types/exam';
import { notifyError, notifySuccess } from '@/utils/notify';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    question?: QuestionAdmin;
  }>(),
  { question: undefined },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<CreateQuestionRequest>({
  text: '',
  options: ['', ''],
  correctIndex: 0,
  explanation: '',
});

const isEdit = computed(() => props.mode === 'edit');

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) return;

    if (isEdit.value && props.question) {
      form.text = props.question.text;
      form.options = [...props.question.options];
      form.correctIndex = props.question.correctIndex ?? 0;
      form.explanation = props.question.explanation ?? '';
      return;
    }

    form.text = '';
    form.options = ['', ''];
    form.correctIndex = 0;
    form.explanation = '';
  },
);

const rules: FormRules<CreateQuestionRequest> = {
  text: [{ required: true, message: 'Question text is required', trigger: 'blur' }],
  options: [
    {
      validator: (_rule, value: string[], callback) => {
        if (!value || value.length < 2 || value.some((item) => !item.trim())) {
          callback(new Error('At least 2 non-empty options are required'));
          return;
        }
        callback();
      },
      trigger: 'change',
    },
  ],
  correctIndex: [
    {
      validator: (_rule, value: number, callback) => {
        if (value < 0 || value >= form.options.length) {
          callback(new Error('Correct option index is invalid'));
          return;
        }
        callback();
      },
      trigger: ['change', 'blur'],
    },
  ],
  explanation: [],
};

const close = (): void => emit('update:modelValue', false);

const submit = async (): Promise<void> => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    if (isEdit.value && props.question) {
      const payload: UpdateQuestionRequest = {
        text: form.text,
        options: form.options,
        correctIndex: form.correctIndex,
        explanation: form.explanation || undefined,
      };
      await examApi.updateQuestion(props.question.id, payload);
      notifySuccess('Question updated');
    } else {
      await examApi.createQuestion({
        text: form.text,
        options: form.options,
        correctIndex: form.correctIndex,
        explanation: form.explanation || undefined,
      });
      notifySuccess('Question created');
    }

    emit('success');
    close();
  } catch (error) {
    notifyError((error as Error).message || 'Question operation failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="isEdit ? 'Edit question' : 'Create question'" width="720px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Question text" prop="text">
        <el-input v-model="form.text" type="textarea" :rows="3" />
      </el-form-item>

      <el-form-item label="Options" prop="options">
        <OptionsEditor :options="form.options" @update="(options) => (form.options = options)" />
      </el-form-item>

      <el-form-item label="Correct option" prop="correctIndex">
        <el-select v-model="form.correctIndex" style="width: 100%">
          <el-option v-for="(_, idx) in form.options" :key="idx" :label="`Option ${idx + 1}`" :value="idx" />
        </el-select>
      </el-form-item>

      <el-form-item label="Explanation" prop="explanation">
        <el-input v-model="form.explanation" type="textarea" :rows="2" />
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
