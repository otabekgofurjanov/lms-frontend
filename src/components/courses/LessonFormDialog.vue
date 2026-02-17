<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import type { Lesson, LessonType } from '@/app/types/courses';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    lesson?: Lesson;
  }>(),
  { lesson: undefined },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [payload: { title: string; lessonType: LessonType; availableAt?: string }];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  title: '',
  lessonType: 'RECORDED' as LessonType,
  availableAt: '',
});

const rules: FormRules<typeof form> = {
  title: [{ required: true, message: 'Lesson title is required', trigger: 'blur' }],
  lessonType: [{ required: true, message: 'Lesson type is required', trigger: 'change' }],
  availableAt: [],
};

const title = computed(() => (props.mode === 'edit' ? 'Edit lesson' : 'Create lesson'));

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) return;

    if (props.mode === 'edit' && props.lesson) {
      form.title = props.lesson.title;
      form.lessonType = props.lesson.lessonType;
      form.availableAt = props.lesson.availableAt ?? '';
      return;
    }

    form.title = '';
    form.lessonType = 'RECORDED';
    form.availableAt = '';
  },
);

const close = (): void => emit('update:modelValue', false);

const onSubmit = async (): Promise<void> => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  emit('submit', {
    title: form.title.trim(),
    lessonType: form.lessonType,
    availableAt: form.availableAt || undefined,
  });
  loading.value = false;
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="title" width="460px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Title" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="Lesson type" prop="lessonType">
        <el-select v-model="form.lessonType" style="width: 100%">
          <el-option label="Live Zoom" value="LIVE_ZOOM" />
          <el-option label="Recorded" value="RECORDED" />
        </el-select>
      </el-form-item>
      <el-form-item label="Available at" prop="availableAt">
        <el-date-picker
          v-model="form.availableAt"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          placeholder="Optional"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-space>
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="onSubmit">Save</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>
