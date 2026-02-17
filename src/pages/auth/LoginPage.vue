<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';

import { useAuthStore } from '@/app/store/auth.store';
import { notifyError, notifySuccess } from '@/utils/notify';

const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  email: '',
  password: '',
});

const rules: FormRules<typeof form> = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
};

const redirectByRole = async (): Promise<void> => {
  if (authStore.hasRole('ADMIN')) {
    await router.push('/admin/dashboard');
    return;
  }
  if (authStore.hasRole('TEACHER')) {
    await router.push('/teacher/dashboard');
    return;
  }
  if (authStore.hasRole('STUDENT')) {
    await router.push('/student/dashboard');
    return;
  }
  await router.push('/forbidden');
};

const onSubmit = async (): Promise<void> => {
  if (!formRef.value) return;

  const isValid = await formRef.value.validate().catch(() => false);
  if (!isValid) return;

  loading.value = true;
  try {
    await authStore.login(form.email, form.password);
    notifySuccess('Login successful');
    await redirectByRole();
  } catch (error) {
    notifyError((error as Error).message || 'Login failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>Login</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="Enter password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="loading" @click="onSubmit">
            Sign in
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 380px;
}
</style>
