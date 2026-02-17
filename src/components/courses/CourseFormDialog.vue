<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import { coursesApi } from '@/app/api/courses.api';
import type { CreateCourseRequest, CourseDetail, UpdateCourseRequest } from '@/app/types/courses';
import { notifyError, notifySuccess } from '@/utils/notify';

interface CourseFormState {
  title: string;
  description: string;
  coverUrl: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    course?: CourseDetail;
  }>(),
  { course: undefined },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<CourseFormState>({
  title: '',
  description: '',
  coverUrl: '',
});

const isEdit = computed(() => props.mode === 'edit');

const rules: FormRules<CourseFormState> = {
  title: [{ required: true, message: 'Title is required', trigger: 'blur' }],
  description: [],
  coverUrl: [{ type: 'url', message: 'Cover URL must be valid', trigger: ['blur', 'change'] }],
};

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) {
      formRef.value?.clearValidate();
      return;
    }

    if (isEdit.value && props.course) {
      form.title = props.course.title;
      form.description = props.course.description ?? '';
      form.coverUrl = props.course.coverUrl ?? '';
      return;
    }

    form.title = '';
    form.description = '';
    form.coverUrl = '';
  },
);

const close = (): void => {
  emit('update:modelValue', false);
};

const submit = async (): Promise<void> => {
  if (!formRef.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    if (isEdit.value && props.course) {
      const payload: UpdateCourseRequest = {
        title: form.title,
        description: form.description || undefined,
        coverUrl: form.coverUrl || undefined,
      };
      await coursesApi.updateCourse(props.course.id, payload);
      notifySuccess('Course updated successfully');
    } else {
      const payload: CreateCourseRequest = {
        title: form.title,
        description: form.description || undefined,
        coverUrl: form.coverUrl || undefined,
      };
      await coursesApi.createCourse(payload);
      notifySuccess('Course created successfully');
    }

    emit('success');
    close();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to save course');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="isEdit ? 'Edit course' : 'Create course'" width="560px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Title" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="Cover URL" prop="coverUrl">
        <el-input v-model="form.coverUrl" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-space>
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="submit">
          {{ isEdit ? 'Save changes' : 'Create course' }}
        </el-button>
      </el-space>
    </template>
  </el-dialog>
</template>
