<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import type { CourseModule } from '@/app/types/courses';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    module?: CourseModule;
  }>(),
  { module: undefined },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [title: string];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({ title: '' });

const rules: FormRules<typeof form> = {
  title: [{ required: true, message: 'Module title is required', trigger: 'blur' }],
};

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) return;
    form.title = props.mode === 'edit' ? props.module?.title ?? '' : '';
  },
);

const close = (): void => emit('update:modelValue', false);

const onSubmit = async (): Promise<void> => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  emit('submit', form.title.trim());
  loading.value = false;
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="mode === 'edit' ? 'Rename module' : 'Create module'" width="420px" @close="close">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Title" prop="title">
        <el-input v-model="form.title" />
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
