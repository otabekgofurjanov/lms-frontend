<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { ElMessageBox } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

import BulkEnrollDialog from '@/components/enrollment/BulkEnrollDialog.vue';
import { coursesApi } from '@/app/api/courses.api';
import { enrollmentApi } from '@/app/api/enrollment.api';
import type { EnrollmentListItem, EnrollmentStatus } from '@/app/types/enrollment';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.courseId);

const query = reactive({
  page: 0,
  size: 10,
  search: '',
});

const loading = ref(false);
const rows = ref<EnrollmentListItem[]>([]);
const total = ref(0);
const courseTitle = ref('');
const bulkOpen = ref(false);

const statusTagType = (status: EnrollmentStatus): 'success' | 'warning' | 'info' => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PAUSED') return 'warning';
  return 'info';
};

const loadCourse = async (): Promise<void> => {
  try {
    const course = await coursesApi.getCourse(courseId);
    courseTitle.value = course.title;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load course details');
  }
};

const loadEnrollments = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await enrollmentApi.adminListEnrollments(courseId, {
      page: query.page,
      size: query.size,
      search: query.search || undefined,
    });

    rows.value = response.items;
    total.value = response.total;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load enrollments');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = useDebounceFn(async () => {
  query.page = 0;
  await loadEnrollments();
}, 400);

watch(
  () => query.search,
  async () => {
    await debouncedSearch();
  },
);

const onPageChange = async (page: number): Promise<void> => {
  query.page = page - 1;
  await loadEnrollments();
};

const onSizeChange = async (size: number): Promise<void> => {
  query.size = size;
  query.page = 0;
  await loadEnrollments();
};

const onStatusChange = async (row: EnrollmentListItem, status: EnrollmentStatus): Promise<void> => {
  if (status === row.enrollmentStatus) {
    return;
  }

  if (status === 'REMOVED') {
    try {
      await ElMessageBox.confirm('Are you sure you want to remove this enrollment?', 'Confirm', {
        type: 'warning',
      });
    } catch {
      return;
    }
  }

  try {
    await enrollmentApi.adminUpdateEnrollmentStatus(row.enrollmentId, status);
    notifySuccess('Enrollment status updated');
    await loadEnrollments();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to update enrollment status');
  }
};


const openAttendanceOps = async (): Promise<void> => {
  await router.push(`/admin/courses/${courseId}/attendance-ops`);
};

const removeEnrollment = async (enrollmentId: number): Promise<void> => {
  try {
    await enrollmentApi.adminRemoveEnrollment(enrollmentId);
    notifySuccess('Enrollment removed');
    await loadEnrollments();
  } catch (error) {
    notifyError((error as Error).message || 'Failed to remove enrollment');
  }
};

await Promise.all([loadCourse(), loadEnrollments()]);
</script>

<template>
  <section class="enrollments-page">
    <div class="enrollments-page__header">
      <div>
        <h2>Enrollments</h2>
        <p>{{ courseTitle || `Course #${courseId}` }}</p>
      </div>
      <el-space>
        <el-button @click="openAttendanceOps">Attendance Ops</el-button>
        <el-button type="primary" @click="bulkOpen = true">Bulk Enroll</el-button>
      </el-space>
    </div>

    <el-card>
      <div class="enrollments-page__filters">
        <el-input v-model="query.search" placeholder="Search student by name/email" clearable style="max-width: 320px" />
      </div>

      <el-table v-loading="loading" :data="rows" border>
        <el-table-column label="Student" min-width="220">
          <template #default="{ row }">{{ row.student.fullName }}</template>
        </el-table-column>
        <el-table-column label="Email" min-width="220">
          <template #default="{ row }">{{ row.student.email }}</template>
        </el-table-column>
        <el-table-column label="Phone" min-width="150">
          <template #default="{ row }">{{ row.student.phone || '-' }}</template>
        </el-table-column>
        <el-table-column label="Status" width="180">
          <template #default="{ row }">
            <el-select
              :model-value="row.enrollmentStatus"
              size="small"
              @change="(value) => onStatusChange(row, value as EnrollmentStatus)"
            >
              <el-option label="ACTIVE" value="ACTIVE" />
              <el-option label="PAUSED" value="PAUSED" />
              <el-option label="REMOVED" value="REMOVED" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="Status tag" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.enrollmentStatus)">{{ row.enrollmentStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Enrolled at" min-width="170">
          <template #default="{ row }">{{ dayjs(row.enrolledAt).format('YYYY-MM-DD HH:mm') }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template #default="{ row }">
            <el-popconfirm title="Remove enrollment?" @confirm="removeEnrollment(row.enrollmentId)">
              <template #reference>
                <el-button type="danger" link>Remove</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="enrollments-page__pagination">
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

    <BulkEnrollDialog v-model="bulkOpen" :course-id="courseId" @success="loadEnrollments" />
  </section>
</template>

<style scoped>
.enrollments-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.enrollments-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.enrollments-page__filters {
  margin-bottom: 12px;
}

.enrollments-page__pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
