<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { zoomApi } from '@/app/api/zoom.api';
import { copyToClipboard } from '@/utils/clipboard';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const router = useRouter();

const lessonId = Number(route.params.lessonId);
const courseId = computed(() => Number(route.query.courseId ?? 0));

const loading = ref(false);
const joinUrl = ref('');

const goBack = async (): Promise<void> => {
  if (courseId.value > 0) {
    await router.push(`/student/courses/${courseId.value}`);
    return;
  }
  await router.push('/student/courses');
};

const loadJoinLink = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await zoomApi.getStudentJoinLink(lessonId);
    joinUrl.value = response.joinUrl;
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 403) {
      notifyError("Siz bu kursga ro'yxatdan o'tmagansiz yoki access yo'q.");
      await goBack();
      return;
    }

    notifyError((error as Error).message || 'Failed to load join link');
  } finally {
    loading.value = false;
  }
};

const openZoom = (): void => {
  window.open(joinUrl.value, '_blank');
};

const copyLink = async (): Promise<void> => {
  const copied = await copyToClipboard(joinUrl.value);
  if (copied) notifySuccess('Join link copied');
  else notifyError('Failed to copy join link');
};

await loadJoinLink();
</script>

<template>
  <section>
    <el-button style="margin-bottom: 12px" @click="goBack">Back</el-button>
    <el-skeleton v-if="loading" :rows="4" animated />

    <el-card v-else>
      <h3>Join Zoom lesson</h3>
      <p>{{ joinUrl }}</p>
      <el-space>
        <el-button type="primary" @click="openZoom">Open Zoom</el-button>
        <el-button @click="copyLink">Copy link</el-button>
      </el-space>
    </el-card>
  </section>
</template>
