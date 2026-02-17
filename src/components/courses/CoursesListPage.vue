<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

import { coursesApi } from '@/app/api/courses.api';
import type { CourseDetail, CourseListItem, CourseStatus } from '@/app/types/courses';
import { notifyError, notifySuccess } from '@/utils/notify';
import CourseFormDialog from './CourseFormDialog.vue';

const router = useRouter();
const route = useRoute();

const query = reactive({
  page: 0,
  size: 10,
  search: '',
  status: '' as '' | CourseStatus,
});

const loading = ref(false);
const items = ref<CourseListItem[]>([]);
const total = ref(0);

const formOpen = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingCourse = ref<CourseDetail | undefined>(undefined);
const formLoading = ref(false);

const isAdmin = computed(() => route.path.startsWith('/admin'));
const basePath = computed(() => (isAdmin.value ? '/admin/courses' : '/teacher/courses'));

const statusTagType = (status: CourseStatus): 'info' | 'success' | 'warning' => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ARCHIVED') return 'warning';
  return 'info';
};

const loadCourses = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await coursesApi.listCourses({
      page: query.page,
      size: query.size,
      search: query.search || undefined,
      status: query.status || undefined,
    });
    items.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load courses');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadCourses();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

watch(
  () => query.status,
  async () => {
    query.page = 0;
    await loadCourses();
  },
);

const openCreate = (): void => {
  formMode.value = 'create';
  editingCourse.value = undefined;
  formOpen.value = true;
};

const openEdit = async (id: number): Promise<void> => {
  formLoading.value = true;
  try {
    editingCourse.value = await coursesApi.getCourse(id);
    formMode.value = 'edit';
    formOpen.value = true;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load course details');
  } finally {
    formLoading.value = false;
  }
};

const updateStatus = async (course: CourseListItem, status: CourseStatus): Promise<void> => {
  if (status === course.status) return;

  if (status === 'ARCHIVED') {
    try {
      await ElMessageBox.confirm('Are you sure you want to archive this course?', 'Confirm', { type: 'warning' });
    } catch {
      return;
    }
  }

  try {
    await coursesApi.updateCourseStatus(course.id, status);
    notifySuccess('Course status updated');
    await loadCourses();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to update status');
  }
};

const openBuilder = async (id: number): Promise<void> => {
  await router.push(`${basePath.value}/${id}`);
};

const openStudents = async (id: number): Promise<void> => {
  await router.push(`/teacher/courses/${id}/students`);
};


const openAttendance = async (id: number): Promise<void> => {
  await router.push(`/teacher/courses/${id}/attendance`);
};


const openExamQuizzes = async (id: number): Promise<void> => {
  await router.push(`/${isAdmin.value ? 'admin' : 'teacher'}/courses/${id}/exam/quizzes`);
};

const openExamQuestions = async (id: number): Promise<void> => {
  await router.push(`/${isAdmin.value ? 'admin' : 'teacher'}/courses/${id}/exam/questions`);
};


const openProgress = async (id: number): Promise<void> => {
  if (isAdmin.value) {
    await router.push(`/admin/courses/${id}/progress`);
    return;
  }
  await router.push(`/teacher/courses/${id}/progress`);
};

const openCompletionRules = async (id: number): Promise<void> => {
  await router.push(`/admin/courses/${id}/completion`);
};

const onStatusCommand = async (course: CourseListItem, command: string): Promise<void> => {
  const nextStatus = command as CourseStatus;
  await updateStatus(course, nextStatus);
};


const onPageChange = async (page: number): Promise<void> => {
  query.page = page - 1;
  await loadCourses();
};

const onSizeChange = async (size: number): Promise<void> => {
  query.size = size;
  query.page = 0;
  await loadCourses();
};

await loadCourses();
</script>

<template>
  <section class="courses-page">
    <div class="courses-page__header">
      <div>
        <h2>Courses</h2>
        <p>Build and manage course structures.</p>
      </div>
      <el-button type="primary" @click="openCreate">Create course</el-button>
    </div>

    <el-card>
      <div class="courses-page__filters">
        <el-input v-model="query.search" clearable placeholder="Search by title" style="max-width: 320px" />
        <el-select v-model="query.status" clearable placeholder="All statuses" style="width: 180px">
          <el-option label="DRAFT" value="DRAFT" />
          <el-option label="ACTIVE" value="ACTIVE" />
          <el-option label="ARCHIVED" value="ARCHIVED" />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="items" border stripe>
        <el-table-column prop="title" label="Title" min-width="220" />
        <el-table-column label="Status" width="140">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created at" min-width="180">
          <template #default="{ row }">{{ dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="Actions" min-width="280" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button link type="primary" @click="openBuilder(row.id)">Open builder</el-button>
              <el-button v-if="!isAdmin" link type="primary" @click="openStudents(row.id)">Students</el-button>
              <el-button v-if="!isAdmin" link type="primary" @click="openAttendance(row.id)">Attendance</el-button>
              <el-button link type="primary" @click="openExamQuizzes(row.id)">Exam Quizzes</el-button>
              <el-button link type="primary" @click="openExamQuestions(row.id)">Question Bank</el-button>
              <el-button link type="primary" @click="openProgress(row.id)">Progress</el-button>
              <el-button v-if="isAdmin" link type="primary" @click="openCompletionRules(row.id)">Completion rules</el-button>
              <el-button link type="primary" :loading="formLoading" @click="openEdit(row.id)">Edit</el-button>
              <el-dropdown v-if="isAdmin" @command="(command) => onStatusCommand(row, command)">
                <el-button link type="warning">Change status</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="DRAFT">DRAFT</el-dropdown-item>
                    <el-dropdown-item command="ACTIVE">ACTIVE</el-dropdown-item>
                    <el-dropdown-item command="ARCHIVED">ARCHIVED</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="courses-page__pagination">
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

    <CourseFormDialog v-model="formOpen" :mode="formMode" :course="editingCourse" @success="loadCourses" />
  </section>
</template>

<style scoped>
.courses-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.courses-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.courses-page__filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.courses-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
