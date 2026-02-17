<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import draggable from 'vuedraggable';

import { coursesApi } from '@/app/api/courses.api';
import { lessonsApi } from '@/app/api/lessons.api';
import { modulesApi } from '@/app/api/modules.api';
import type { CourseDetail, CourseModule, CreateLessonRequest, Lesson, LessonType } from '@/app/types/courses';
import { notifyError, notifySuccess } from '@/utils/notify';
import LessonFormDialog from './LessonFormDialog.vue';
import ModuleFormDialog from './ModuleFormDialog.vue';

const route = useRoute();
const router = useRouter();
const courseId = Number(route.params.id);
const isTeacher = route.path.startsWith('/teacher');

const loading = ref(true);
const course = ref<CourseDetail | null>(null);
const modules = ref<CourseModule[]>([]);
const selectedModuleId = ref<number | null>(null);

const lessonsByModule = reactive<Record<number, Lesson[]>>({});
const lessonLoadingByModule = reactive<Record<number, boolean>>({});

const moduleDialogOpen = ref(false);
const moduleDialogMode = ref<'create' | 'edit'>('create');
const editingModule = ref<CourseModule | undefined>(undefined);

const lessonDialogOpen = ref(false);
const lessonDialogMode = ref<'create' | 'edit'>('create');
const editingLesson = ref<Lesson | undefined>(undefined);

const currentModule = computed(() => modules.value.find((item) => item.id === selectedModuleId.value) || null);
const currentLessons = computed(() => {
  const id = selectedModuleId.value;
  if (!id) return [];
  return lessonsByModule[id] ?? [];
});

const lessonListModel = computed<Lesson[]>({
  get: () => currentLessons.value,
  set: (value) => {
    if (!selectedModuleId.value) return;
    lessonsByModule[selectedModuleId.value] = value;
  },
});

const previousModulesOrder = ref<CourseModule[]>([]);
const previousLessonsOrder = reactive<Record<number, Lesson[]>>({});

const statusTagType = computed(() => {
  if (course.value?.status === 'ACTIVE') return 'success';
  if (course.value?.status === 'ARCHIVED') return 'warning';
  return 'info';
});

const backToList = async (): Promise<void> => {
  const base = route.path.startsWith('/admin') ? '/admin/courses' : '/teacher/courses';
  await router.push(base);
};

const loadLessons = async (moduleId: number): Promise<void> => {
  lessonLoadingByModule[moduleId] = true;
  try {
    lessonsByModule[moduleId] = await lessonsApi.listLessons(moduleId);
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load lessons');
  } finally {
    lessonLoadingByModule[moduleId] = false;
  }
};

const loadBuilder = async (): Promise<void> => {
  loading.value = true;
  try {
    course.value = await coursesApi.getCourse(courseId);
    modules.value = await modulesApi.listModules(courseId);

    if (modules.value.length > 0) {
      selectedModuleId.value = modules.value[0].id;
      await loadLessons(selectedModuleId.value);
    }
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 404) {
      await router.push('/not-found');
      return;
    }
    notifyError((error as Error).message || 'Failed to load course builder');
  } finally {
    loading.value = false;
  }
};

const selectModule = async (moduleId: number): Promise<void> => {
  selectedModuleId.value = moduleId;
  if (!lessonsByModule[moduleId]) {
    await loadLessons(moduleId);
  }
};

const openCreateModule = (): void => {
  moduleDialogMode.value = 'create';
  editingModule.value = undefined;
  moduleDialogOpen.value = true;
};

const openEditModule = (module: CourseModule): void => {
  moduleDialogMode.value = 'edit';
  editingModule.value = module;
  moduleDialogOpen.value = true;
};

const submitModule = async (title: string): Promise<void> => {
  try {
    if (moduleDialogMode.value === 'edit' && editingModule.value) {
      await modulesApi.updateModule(editingModule.value.id, { title });
      notifySuccess('Module updated');
    } else {
      await modulesApi.createModule(courseId, { title });
      notifySuccess('Module created');
    }
    moduleDialogOpen.value = false;
    modules.value = await modulesApi.listModules(courseId);
    if (!selectedModuleId.value && modules.value.length > 0) {
      selectedModuleId.value = modules.value[0].id;
    }
  } catch (error) {
    notifyError((error as Error).message || 'Module operation failed');
  }
};

const deleteModule = async (module: CourseModule): Promise<void> => {
  try {
    await ElMessageBox.confirm('Delete this module?', 'Confirm', { type: 'warning' });
    await modulesApi.deleteModule(module.id);
    notifySuccess('Module deleted');
    delete lessonsByModule[module.id];
    modules.value = modules.value.filter((item) => item.id !== module.id);
    if (selectedModuleId.value === module.id) {
      selectedModuleId.value = modules.value[0]?.id ?? null;
      if (selectedModuleId.value) await loadLessons(selectedModuleId.value);
    }
  } catch {
    // canceled or failed
  }
};

const openCreateLesson = (): void => {
  lessonDialogMode.value = 'create';
  editingLesson.value = undefined;
  lessonDialogOpen.value = true;
};

const openEditLesson = (lesson: Lesson): void => {
  lessonDialogMode.value = 'edit';
  editingLesson.value = lesson;
  lessonDialogOpen.value = true;
};


const openLessonZoom = async (lessonId: number): Promise<void> => {
  await router.push(`/teacher/lessons/${lessonId}/zoom`);
};

const submitLesson = async (payload: { title: string; lessonType: LessonType; availableAt?: string }): Promise<void> => {
  if (!selectedModuleId.value) return;

  try {
    if (lessonDialogMode.value === 'edit' && editingLesson.value) {
      await lessonsApi.updateLesson(editingLesson.value.id, payload);
      notifySuccess('Lesson updated');
    } else {
      const createPayload: CreateLessonRequest = payload;
      await lessonsApi.createLesson(selectedModuleId.value, createPayload);
      notifySuccess('Lesson created');
    }

    lessonDialogOpen.value = false;
    await loadLessons(selectedModuleId.value);
  } catch (error) {
    notifyError((error as Error).message || 'Lesson operation failed');
  }
};

const deleteLesson = async (lesson: Lesson): Promise<void> => {
  try {
    await ElMessageBox.confirm('Delete this lesson?', 'Confirm', { type: 'warning' });
    await lessonsApi.deleteLesson(lesson.id);
    notifySuccess('Lesson deleted');
    if (selectedModuleId.value) await loadLessons(selectedModuleId.value);
  } catch {
    // canceled or failed
  }
};

const sendModulesReorder = useDebounceFn(async (prevOrder: CourseModule[]) => {
  const ids = modules.value.map((module) => module.id);
  try {
    await modulesApi.reorderModules(courseId, ids);
  } catch (error) {
    modules.value = prevOrder;
    notifyError((error as Error).message || 'Failed to reorder modules');
  }
}, 350);

const onModuleDragStart = (): void => {
  previousModulesOrder.value = [...modules.value];
};

const onModuleReorder = async (): Promise<void> => {
  await sendModulesReorder(previousModulesOrder.value);
};

const sendLessonsReorder = useDebounceFn(async (moduleId: number, prevOrder: Lesson[]) => {
  try {
    await lessonsApi.reorderLessons(
      moduleId,
      (lessonsByModule[moduleId] ?? []).map((lesson) => lesson.id),
    );
  } catch (error) {
    lessonsByModule[moduleId] = prevOrder;
    notifyError((error as Error).message || 'Failed to reorder lessons');
  }
}, 350);

const onLessonDragStart = (): void => {
  if (!selectedModuleId.value) return;
  previousLessonsOrder[selectedModuleId.value] = [...(lessonsByModule[selectedModuleId.value] ?? [])];
};

const onLessonReorder = async (): Promise<void> => {
  if (!selectedModuleId.value) return;
  const moduleId = selectedModuleId.value;
  await sendLessonsReorder(moduleId, previousLessonsOrder[moduleId] ?? []);
};

await loadBuilder();
</script>

<template>
  <section class="builder-page">
    <el-skeleton v-if="loading" animated :rows="10" />

    <template v-else>
      <div class="builder-page__header">
        <el-button @click="backToList">Back</el-button>
        <div>
          <h2>{{ course?.title }}</h2>
          <el-tag :type="statusTagType">{{ course?.status }}</el-tag>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :span="10">
          <el-card>
            <template #header>
              <div class="panel-header">
                <span>Modules</span>
                <el-button size="small" type="primary" @click="openCreateModule">Add module</el-button>
              </div>
            </template>

            <draggable v-model="modules" item-key="id" handle=".drag-handle" @start="onModuleDragStart" @end="onModuleReorder">
              <template #item="{ element }">
                <div
                  class="sortable-item"
                  :class="{ active: selectedModuleId === element.id }"
                  @click="selectModule(element.id)"
                >
                  <span class="drag-handle">⋮⋮</span>
                  <span>{{ element.title }}</span>
                  <el-dropdown trigger="click" @command="(cmd) => (cmd === 'edit' ? openEditModule(element) : deleteModule(element))">
                    <el-button link>•••</el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">Rename</el-dropdown-item>
                        <el-dropdown-item command="delete">Delete</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </draggable>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card>
            <template #header>
              <div class="panel-header">
                <span>Lessons {{ currentModule ? `— ${currentModule.title}` : '' }}</span>
                <el-button size="small" type="primary" :disabled="!selectedModuleId" @click="openCreateLesson">
                  Add lesson
                </el-button>
              </div>
            </template>

            <el-skeleton v-if="selectedModuleId && lessonLoadingByModule[selectedModuleId]" :rows="5" animated />
            <draggable v-else v-model="lessonListModel" item-key="id" handle=".drag-handle" @start="onLessonDragStart" @end="onLessonReorder">
              <template #item="{ element }">
                <div class="sortable-item">
                  <span class="drag-handle">⋮⋮</span>
                  <div class="lesson-info">
                    <strong>{{ element.title }}</strong>
                    <el-space>
                      <el-tag size="small">{{ element.lessonType }}</el-tag>
                      <span v-if="element.availableAt" class="muted">{{ element.availableAt }}</span>
                    </el-space>
                  </div>
                  <el-space>
                    <el-button v-if="isTeacher && element.lessonType === 'LIVE_ZOOM'" link type="primary" @click="openLessonZoom(element.id)">Schedule Zoom</el-button>
                    <el-button link type="primary" @click="openEditLesson(element)">Edit</el-button>
                    <el-button link type="danger" @click="deleteLesson(element)">Delete</el-button>
                  </el-space>
                </div>
              </template>
            </draggable>
          </el-card>
        </el-col>
      </el-row>

      <ModuleFormDialog
        v-model="moduleDialogOpen"
        :mode="moduleDialogMode"
        :module="editingModule"
        @submit="submitModule"
      />

      <LessonFormDialog
        v-model="lessonDialogOpen"
        :mode="lessonDialogMode"
        :lesson="editingLesson"
        @submit="submitLesson"
      />
    </template>
  </section>
</template>

<style scoped>
.builder-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.builder-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sortable-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fff;
}

.sortable-item.active {
  border-color: #409eff;
}

.drag-handle {
  cursor: move;
  color: #9ca3af;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.muted {
  color: #6b7280;
  font-size: 12px;
}
</style>
