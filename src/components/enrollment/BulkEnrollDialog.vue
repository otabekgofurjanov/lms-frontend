<script setup lang="ts">
import { computed, ref } from 'vue';

import { adminUsersApi } from '@/app/api/admin.users.api';
import { enrollmentApi } from '@/app/api/enrollment.api';
import type { BulkEnrollResult } from '@/app/types/enrollment';
import type { UserListItem } from '@/app/types/users';
import { notifyError, notifySuccess } from '@/utils/notify';

const props = defineProps<{
  modelValue: boolean;
  courseId: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const loading = ref(false);
const search = ref('');
const candidates = ref<UserListItem[]>([]);
const selectedStudents = ref<UserListItem[]>([]);
const result = ref<BulkEnrollResult | null>(null);

const selectedIds = computed(() => selectedStudents.value.map((student) => student.id));

const close = (): void => {
  emit('update:modelValue', false);
};

const searchStudents = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await adminUsersApi.listUsers({
      page: 0,
      size: 50,
      search: search.value || undefined,
    });
    candidates.value = response.items.filter((user) => user.roles.includes('STUDENT'));
  } catch (error) {
    notifyError((error as Error).message || 'Failed to search students');
  } finally {
    loading.value = false;
  }
};

const addStudent = (student: UserListItem): void => {
  if (selectedStudents.value.some((item) => item.id === student.id)) {
    return;
  }
  selectedStudents.value.push(student);
};

const removeStudent = (studentId: string): void => {
  selectedStudents.value = selectedStudents.value.filter((item) => item.id !== studentId);
};

const submit = async (): Promise<void> => {
  if (selectedIds.value.length === 0) {
    notifyError('Please select at least one student');
    return;
  }

  loading.value = true;
  try {
    result.value = await enrollmentApi.adminBulkEnroll(props.courseId, selectedIds.value.map(Number));
    notifySuccess('Bulk enroll completed');
    emit('success');
  } catch (error) {
    notifyError((error as Error).message || 'Bulk enroll failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="modelValue" title="Bulk Enroll Students" width="900px" @close="close">
    <div class="bulk-enroll">
      <el-card shadow="never">
        <div class="bulk-enroll__search">
          <el-input v-model="search" clearable placeholder="Search students by full name or email" />
          <el-button :loading="loading" @click="searchStudents">Search</el-button>
        </div>

        <el-table v-loading="loading" :data="candidates" height="280">
          <el-table-column prop="fullName" label="Full name" />
          <el-table-column prop="email" label="Email" />
          <el-table-column label="Action" width="120">
            <template #default="{ row }">
              <el-button link type="primary" @click="addStudent(row)">Add</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never">
        <template #header>Selected students ({{ selectedStudents.length }})</template>
        <el-empty v-if="selectedStudents.length === 0" description="No students selected" />
        <el-space v-else wrap>
          <el-tag v-for="student in selectedStudents" :key="student.id" closable @close="removeStudent(student.id)">
            {{ student.fullName }}
          </el-tag>
        </el-space>
      </el-card>

      <el-card v-if="result" shadow="never">
        <template #header>Bulk enroll result</template>
        <el-row :gutter="12">
          <el-col :span="6"><el-statistic title="Total" :value="result.total" /></el-col>
          <el-col :span="6"><el-statistic title="Created" :value="result.created" /></el-col>
          <el-col :span="6"><el-statistic title="Reactivated" :value="result.reactivated" /></el-col>
          <el-col :span="6"><el-statistic title="Skipped" :value="result.skipped" /></el-col>
        </el-row>
        <el-statistic title="Failed" :value="result.failed" />
        <el-card v-if="result.errors.length > 0" class="errors" shadow="never">
          <ul>
            <li v-for="(item, idx) in result.errors" :key="`${idx}-${item}`">{{ item }}</li>
          </ul>
        </el-card>
      </el-card>
    </div>

    <template #footer>
      <el-space>
        <el-button @click="close">Close</el-button>
        <el-button type="primary" :loading="loading" @click="submit">Enroll selected</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<style scoped>
.bulk-enroll {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bulk-enroll__search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.errors {
  margin-top: 12px;
  max-height: 120px;
  overflow: auto;
}
</style>
