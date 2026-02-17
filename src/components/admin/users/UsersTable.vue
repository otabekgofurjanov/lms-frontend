<script setup lang="ts">
import { computed } from 'vue';

import type { UserListItem, UserStatus } from '@/app/types/users';

const props = defineProps<{
  items: UserListItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  edit: [userId: string];
  toggleStatus: [user: UserListItem];
  view: [userId: string];
}>();

const statusTypeMap: Record<UserStatus, 'success' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  BLOCKED: 'danger',
  DELETED: 'info',
};

const hasData = computed(() => props.items.length > 0);
</script>

<template>
  <el-table v-loading="loading" :data="items" stripe border style="width: 100%" empty-text="No users found">
    <el-table-column prop="fullName" label="Full name" min-width="180" />
    <el-table-column prop="email" label="Email" min-width="220" />
    <el-table-column prop="phone" label="Phone" min-width="150" />
    <el-table-column label="Roles" min-width="180">
      <template #default="{ row }">
        <el-space wrap>
          <el-tag v-for="role in row.roles" :key="role" type="warning">{{ role }}</el-tag>
        </el-space>
      </template>
    </el-table-column>
    <el-table-column label="Status" min-width="120">
      <template #default="{ row }">
        <el-tag :type="statusTypeMap[row.status]">{{ row.status }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Actions" fixed="right" min-width="220">
      <template #default="{ row }">
        <el-space>
          <el-button link type="primary" @click="emit('view', row.id)">View</el-button>
          <el-button link type="primary" @click="emit('edit', row.id)">Edit</el-button>
          <el-button
            v-if="row.status !== 'DELETED'"
            link
            :type="row.status === 'ACTIVE' ? 'danger' : 'success'"
            @click="emit('toggleStatus', row)"
          >
            {{ row.status === 'ACTIVE' ? 'Block' : 'Unblock' }}
          </el-button>
        </el-space>
      </template>
    </el-table-column>
    <template v-if="!hasData" #empty>
      <el-empty description="No users found" />
    </template>
  </el-table>
</template>
