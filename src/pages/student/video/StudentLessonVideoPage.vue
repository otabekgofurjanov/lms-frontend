<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

import VideoPlayer from '@/components/video/VideoPlayer.vue';
import VideoStatusPanel from '@/components/video/VideoStatusPanel.vue';
import { videoApi } from '@/app/api/video.api';
import type {
  LessonVideoResponse,
  VideoProgressEventRequest,
  VideoProgressResponse,
  VideoProgressSnapshot,
  VideoSessionResponse,
} from '@/app/types/video';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const router = useRouter();
const documentVisibility = useDocumentVisibility();

const lessonId = Number(route.params.lessonId);
const courseId = computed(() => Number(route.query.courseId ?? 0));

const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);

const loading = ref(false);
const status = ref<LessonVideoResponse['status']>('PENDING');
const videoUrl = ref('');
const checksum = ref('');
const expiresAt = ref<number | null>(null);

const session = ref<VideoSessionResponse | null>(null);
const snapshot = ref<VideoProgressSnapshot | null>(null);
const progress = ref<VideoProgressResponse | null>(null);

const tabSwitchTotal = ref(0);
const seekAttemptTotal = ref(0);

const tabSwitchDelta = ref(0);
const seekAttemptDelta = ref(0);

const isPlaying = ref(false);
const hiddenOverlay = ref(false);

let progressTimeout: number | null = null;
let refreshTimer: number | null = null;
let lastPingAt = Date.now();
let pingDelayMs = 5000;

const lessonTitle = computed(() => String(route.query.lessonTitle ?? `Lesson #${lessonId}`));

const completionPct = computed(() => progress.value?.completionPct ?? snapshot.value?.completionPct ?? 0);
const canUnlockQuiz = computed(() => progress.value?.canUnlockQuiz ?? false);

const backToCourse = async (): Promise<void> => {
  if (courseId.value > 0) {
    await router.push(`/student/courses/${courseId.value}`);
    return;
  }
  await router.push('/student/courses');
};

const clearTimers = (): void => {
  if (progressTimeout) {
    window.clearTimeout(progressTimeout);
    progressTimeout = null;
  }
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const applyVideoResponse = async (response: LessonVideoResponse): Promise<void> => {
  status.value = response.status;
  checksum.value = response.checksumSha256 ?? '';

  if (response.status !== 'READY' || !response.videoUrl) {
    videoUrl.value = '';
    return;
  }

  if (!videoUrl.value) {
    videoUrl.value = response.videoUrl;
  } else if (videoUrl.value !== response.videoUrl) {
    const current = playerRef.value?.getCurrentTime() ?? 0;
    videoUrl.value = response.videoUrl;
    await playerRef.value?.setSource(response.videoUrl, current);
  }

  expiresAt.value = response.expiresInSeconds
    ? Date.now() + response.expiresInSeconds * 1000
    : null;
};

const loadVideo = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await videoApi.getLessonVideo(lessonId);
    await applyVideoResponse(response);
  } catch (error) {
    const statusCode = (error as { response?: { status?: number } }).response?.status;
    if (statusCode === 403) {
      notifyError("Siz bu darsga kirish huquqiga ega emassiz.");
      await backToCourse();
      return;
    }

    notifyError((error as Error).message || 'Failed to load video status');
  } finally {
    loading.value = false;
  }
};

const initSessionAndSnapshot = async (): Promise<void> => {
  if (status.value !== 'READY') {
    return;
  }

  try {
    session.value = await videoApi.createVideoSession(lessonId);
    snapshot.value = await videoApi.getVideoProgress(lessonId);

    const initialTime = Math.max(0, Math.min(snapshot.value.watchedSeconds || 0, snapshot.value.totalSeconds || 0));
    if (initialTime > 0) {
      playerRef.value?.seekTo(initialTime);
    }
  } catch (error) {
    notifyError((error as Error).message || 'Failed to initialize video session');
  }
};

const buildProgressPayload = (): VideoProgressEventRequest | null => {
  if (!session.value || !playerRef.value) {
    return null;
  }

  const duration = playerRef.value.getDuration();
  if (!duration || Number.isNaN(duration)) {
    return null;
  }

  const now = Date.now();
  const elapsedSec = Math.max(0, (now - lastPingAt) / 1000);
  lastPingAt = now;

  const watchedDeltaSeconds = isPlaying.value ? Math.min(15, Math.floor(elapsedSec)) : 0;

  const payload: VideoProgressEventRequest = {
    sessionId: session.value.sessionId,
    currentSecond: Math.floor(playerRef.value.getCurrentTime()),
    watchedDeltaSeconds,
    totalSeconds: Math.floor(duration),
    eventTime: new Date().toISOString(),
    tabVisible: documentVisibility.value === 'visible',
    tabSwitchCountDelta: tabSwitchDelta.value,
    seekAttemptDelta: seekAttemptDelta.value,
  };

  tabSwitchDelta.value = 0;
  seekAttemptDelta.value = 0;

  return payload;
};

const sendProgress = async (): Promise<void> => {
  const payload = buildProgressPayload();
  if (!payload) return;

  try {
    progress.value = await videoApi.sendVideoProgress(lessonId, payload);
    pingDelayMs = 5000;
  } catch (error) {
    const statusCode = (error as { response?: { status?: number } }).response?.status;
    if (statusCode === 429) {
      pingDelayMs = 8000;
      return;
    }
    if (statusCode === 403) {
      notifyError('Video access revoked');
      await backToCourse();
      return;
    }
    notifyError((error as Error).message || 'Failed to send progress');
  }
};

const scheduleProgressPing = (): void => {
  if (progressTimeout) {
    window.clearTimeout(progressTimeout);
  }

  progressTimeout = window.setTimeout(async () => {
    await sendProgress();
    scheduleProgressPing();
  }, pingDelayMs);
};

const startProgressPing = (): void => {
  clearTimers();
  lastPingAt = Date.now();
  scheduleProgressPing();

  refreshTimer = window.setInterval(async () => {
    if (!expiresAt.value) return;
    const remainingMs = expiresAt.value - Date.now();
    if (remainingMs <= 30000) {
      await loadVideo();
    }
  }, 5000);
};

const onSeekingAttempt = (): void => {
  seekAttemptTotal.value += 1;
  seekAttemptDelta.value += 1;
  notifyError('Forward seek blocked');
};

const onPlayingState = (playing: boolean): void => {
  isPlaying.value = playing;
};

watch(
  () => documentVisibility.value,
  (state) => {
    if (state === 'hidden') {
      hiddenOverlay.value = true;
      tabSwitchTotal.value += 1;
      tabSwitchDelta.value += 1;
      playerRef.value?.pause();
    } else {
      hiddenOverlay.value = false;
    }
  },
);

await loadVideo();
await initSessionAndSnapshot();
startProgressPing();

onBeforeUnmount(async () => {
  await sendProgress();
  clearTimers();
});
</script>

<template>
  <section class="video-page">
    <div class="video-page__header">
      <el-button @click="backToCourse">Back to course</el-button>
      <el-space>
        <span>{{ lessonTitle }}</span>
        <el-tag type="success">Completion: {{ completionPct.toFixed(1) }}%</el-tag>
        <el-tag :type="canUnlockQuiz ? 'success' : 'info'">
          {{ canUnlockQuiz ? 'Quiz unlocked' : 'Quiz locked' }}
        </el-tag>
      </el-space>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />

    <el-alert v-else-if="status === 'PENDING'" type="info" :closable="false" title="Recording tayyor emas" />
    <el-alert v-else-if="status === 'FAILED'" type="error" :closable="false" title="Video yuklashda xato" />

    <el-row v-else :gutter="16">
      <el-col :span="17">
        <VideoPlayer
          ref="playerRef"
          :src="videoUrl"
          :blocked="hiddenOverlay"
          :initial-time="snapshot?.watchedSeconds || 0"
          @seeking-attempt="onSeekingAttempt"
          @playing-state="onPlayingState"
        />
      </el-col>
      <el-col :span="7">
        <VideoStatusPanel
          :snapshot="snapshot"
          :checksum-sha256="checksum"
          :tab-switch-count="tabSwitchTotal"
          :seek-attempt-count="seekAttemptTotal"
        />
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.video-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
