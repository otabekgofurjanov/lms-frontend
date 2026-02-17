<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import { adminUsersApi } from '@/app/api/admin.users.api';
import type { CreateUserRequest, RoleItem, UpdateUserRequest } from '@/app/types/users';
import { notifyError, notifySuccess } from '@/utils/notify';

interface UserFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: 'create' | 'edit';
    userId?: string;
    roles: RoleItem[];
  }>(),
  {
    userId: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const fetchLoading = ref(false);

const form = reactive<UserFormState>({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  roles: [],
});

const isEdit = computed(() => props.mode === 'edit');
const title = computed(() => (isEdit.value ? 'Edit user' : 'Create user'));

const rules = computed<FormRules<UserFormState>>(() => ({
  fullName: [{ required: true, message: 'Full name is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Email format is invalid', trigger: ['blur', 'change'] },
  ],
  phone: [],
  password: isEdit.value
    ? []
    : [{ required: true, message: 'Password is required', trigger: 'blur' }],
  roles: [{ required: true, message: 'At least one role is required', trigger: 'change' }],
}));

const close = (): void => {
  emit('update:modelValue', false);
};

const resetForm = (): void => {
  form.fullName = '';
  form.email = '';
  form.phone = '';
  form.password = '';
  form.roles = [];
  formRef.value?.clearValidate();
};

const loadUser = async (): Promise<void> => {
  if (!props.userId || !isEdit.value) {
    return;
  }

  fetchLoading.value = true;
  try {
    const user = await adminUsersApi.getUser(props.userId);
    form.fullName = user.fullName;
    form.email = user.email;
    form.phone = user.phone ?? '';
    form.roles = [...user.roles];
    form.password = '';
  } catch (error) {
    notifyError((error as Error).message || 'Failed to fetch user details');
  } finally {
    fetchLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  async (opened) => {
    if (!opened) {
      resetForm();
      return;
    }

    if (isEdit.value) {
      await loadUser();
    }
  },
);

const submit = async (): Promise<void> => {
  if (!formRef.value) {
    return;
  }

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    if (isEdit.value && props.userId) {
      const payload: UpdateUserRequest = {
        fullName: form.fullName,
        phone: form.phone || undefined,
        roles: form.roles as CreateUserRequest['roles'],
      };
      await adminUsersApi.updateUser(props.userId, payload);
      notifySuccess('User updated successfully');
    } else {
      const payload: CreateUserRequest = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        roles: form.roles as CreateUserRequest['roles'],
      };
      await adminUsersApi.createUser(payload);
      notifySuccess('User created successfully');
    }

    emit('success');
    close();
  } catch (error) {
    notifyError((error as Error).message || 'Operation failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="modelValue" :title="title" width="560px" @close="close">
    <el-skeleton v-if="fetchLoading" :rows="6" animated />
    <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="Full name" prop="fullName">
        <el-input v-model="form.fullName" />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" :disabled="isEdit" />
      </el-form-item>

      <el-form-item label="Phone" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="Password" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>

      <el-form-item label="Roles" prop="roles">
        <el-select v-model="form.roles" multiple placeholder="Select roles" style="width: 100%">
          <el-option v-for="role in roles" :key="role.code" :label="role.name" :value="role.code" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-space>
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="submit">
          {{ isEdit ? 'Save changes' : 'Create user' }}
        </el-button>
      </el-space>
    </template>
  </el-dialog>
</template>
