<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { ElMessageBox } from 'element-plus';

import { adminMetaApi } from '@/app/api/admin.meta.api';
import { adminUsersApi } from '@/app/api/admin.users.api';
import type { RoleItem, UserListItem } from '@/app/types/users';
import { notifyError, notifySuccess } from '@/utils/notify';
import UserFormDialog from '@/components/admin/users/UserFormDialog.vue';
import UserImportDialog from '@/components/admin/users/UserImportDialog.vue';
import UsersTable from '@/components/admin/users/UsersTable.vue';
import UserViewDrawer from '@/components/admin/users/UserViewDrawer.vue';

const query = reactive({
  page: 0,
  size: 10,
  search: '',
});

const tableLoading = ref(false);
const rolesLoading = ref(false);
const users = ref<UserListItem[]>([]);
const total = ref(0);
const roles = ref<RoleItem[]>([]);

const formOpen = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const activeUserId = ref<string | undefined>(undefined);

const importOpen = ref(false);
const drawerOpen = ref(false);
const drawerUserId = ref<string | undefined>(undefined);

const loadRoles = async (): Promise<void> => {
  rolesLoading.value = true;
  try {
    roles.value = await adminMetaApi.getRoles();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load roles');
  } finally {
    rolesLoading.value = false;
  }
};

const loadUsers = async (): Promise<void> => {
  tableLoading.value = true;
  try {
    const result = await adminUsersApi.listUsers(query);
    users.value = result.items;
    total.value = result.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load users');
  } finally {
    tableLoading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadUsers();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

const onPageChange = async (page: number): Promise<void> => {
  query.page = page - 1;
  await loadUsers();
};

const onSizeChange = async (size: number): Promise<void> => {
  query.size = size;
  query.page = 0;
  await loadUsers();
};

const openCreate = (): void => {
  formMode.value = 'create';
  activeUserId.value = undefined;
  formOpen.value = true;
};

const openEdit = (userId: string): void => {
  formMode.value = 'edit';
  activeUserId.value = userId;
  formOpen.value = true;
};

const openView = (userId: string): void => {
  drawerUserId.value = userId;
  drawerOpen.value = true;
};

const toggleStatus = async (user: UserListItem): Promise<void> => {
  const targetStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
  const actionText = targetStatus === 'BLOCKED' ? 'block' : 'unblock';

  try {
    await ElMessageBox.confirm(`Are you sure you want to ${actionText} this user?`, 'Confirm', {
      type: 'warning',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });

    await adminUsersApi.updateUserStatus(user.id, targetStatus);
    notifySuccess(`User ${actionText}ed successfully`);
    await loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      notifyError((error as Error).message || 'Status update failed');
    }
  }
};

const onDialogSuccess = async (): Promise<void> => {
  await loadUsers();
};

await Promise.all([loadRoles(), loadUsers()]);
</script>

<template>
  <section class="users-page">
    <div class="users-page__header">
      <div>
        <h2>Users</h2>
        <p>Manage LMS users and roles.</p>
      </div>
      <el-space>
        <el-button :loading="rolesLoading" @click="importOpen = true">Import CSV</el-button>
        <el-button type="primary" :loading="rolesLoading" @click="openCreate">Create user</el-button>
      </el-space>
    </div>

    <el-card>
      <div class="users-page__filters">
        <el-input
          v-model="query.search"
          clearable
          placeholder="Search by full name or email"
          style="max-width: 380px"
        />
      </div>

      <UsersTable :items="users" :loading="tableLoading" @edit="openEdit" @toggle-status="toggleStatus" @view="openView" />

      <div class="users-page__pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="query.size"
          :current-page="query.page + 1"
          :page-sizes="[10, 20, 50]"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <UserFormDialog
      v-model="formOpen"
      :mode="formMode"
      :user-id="activeUserId"
      :roles="roles"
      @success="onDialogSuccess"
    />
    <UserImportDialog v-model="importOpen" @success="onDialogSuccess" />
    <UserViewDrawer v-model="drawerOpen" :user-id="drawerUserId" />
  </section>
</template>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.users-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.users-page__header h2 {
  margin: 0;
}

.users-page__header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.users-page__filters {
  margin-bottom: 16px;
}

.users-page__pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
