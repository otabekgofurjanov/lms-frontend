<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';

import { adminUsersApi } from '@/app/api/admin.users.api';
import type { UserDetailResponse } from '@/app/types/users';
import { notifyError } from '@/utils/notify';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    userId?: string;
  }>(),
  {
    userId: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const loading = ref(false);
const user = ref<UserDetailResponse | null>(null);

const createdAt = computed(() => {
  if (!user.value?.createdAt) {
    return '-';
  }
  return dayjs(user.value.createdAt).format('YYYY-MM-DD HH:mm');
});

const close = (): void => {
  emit('update:modelValue', false);
};

watch(
  () => props.modelValue,
  async (opened) => {
    if (!opened || !props.userId) {
      return;
    }

    loading.value = true;
    try {
      user.value = await adminUsersApi.getUser(props.userId);
    } catch (error) {
      notifyError((error as Error).message || 'Failed to fetch user');
    } finally {
      loading.value = false;
    }
  },
);
</script>

<template>
  <el-drawer :model-value="modelValue" title="User details" size="420px" @close="close">
    <el-skeleton v-if="loading" :rows="8" animated />
    <el-descriptions v-else-if="user" :column="1" border>
      <el-descriptions-item label="Full name">{{ user.fullName }}</el-descriptions-item>
      <el-descriptions-item label="Email">{{ user.email }}</el-descriptions-item>
      <el-descriptions-item label="Phone">{{ user.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <el-tag :type="user.status === 'ACTIVE' ? 'success' : user.status === 'BLOCKED' ? 'danger' : 'info'">
          {{ user.status }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Roles">
        <el-space wrap>
          <el-tag v-for="role in user.roles" :key="role" type="warning">{{ role }}</el-tag>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="Created at">{{ createdAt }}</el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>
