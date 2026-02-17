<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    poster?: string;
    initialTime?: number;
    blocked?: boolean;
  }>(),
  {
    poster: undefined,
    initialTime: 0,
    blocked: false,
  },
);

const emit = defineEmits<{
  timeUpdate: [payload: { currentTime: number; duration: number }];
  seekingAttempt: [payload: { attemptedTime: number; revertedTo: number }];
  playingState: [playing: boolean];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const lastAllowedTime = ref(0);
const isProgrammaticSeek = ref(false);

const safeDuration = computed(() => {
  const duration = videoRef.value?.duration ?? 0;
  return Number.isFinite(duration) ? duration : 0;
});

const onTimeUpdate = (): void => {
  const player = videoRef.value;
  if (!player) return;

  if (isPlaying.value) {
    lastAllowedTime.value = Math.max(lastAllowedTime.value, player.currentTime);
  }

  emit('timeUpdate', {
    currentTime: player.currentTime,
    duration: safeDuration.value,
  });
};

const onPlay = (): void => {
  isPlaying.value = true;
  emit('playingState', true);
};

const onPause = (): void => {
  isPlaying.value = false;
  emit('playingState', false);
};

const onSeeking = (): void => {
  const player = videoRef.value;
  if (!player || isProgrammaticSeek.value) return;

  if (player.currentTime > lastAllowedTime.value + 2) {
    const attempted = player.currentTime;
    isProgrammaticSeek.value = true;
    player.currentTime = lastAllowedTime.value;
    emit('seekingAttempt', {
      attemptedTime: attempted,
      revertedTo: lastAllowedTime.value,
    });
    window.setTimeout(() => {
      isProgrammaticSeek.value = false;
    }, 0);
  }
};

const pause = (): void => {
  videoRef.value?.pause();
};

const getCurrentTime = (): number => videoRef.value?.currentTime ?? 0;

const getDuration = (): number => safeDuration.value;

const seekTo = (seconds: number): void => {
  if (!videoRef.value) return;
  isProgrammaticSeek.value = true;
  videoRef.value.currentTime = Math.max(0, seconds);
  lastAllowedTime.value = Math.max(lastAllowedTime.value, seconds);
  window.setTimeout(() => {
    isProgrammaticSeek.value = false;
  }, 0);
};

const setSource = async (src: string, restoreTime: number): Promise<void> => {
  const player = videoRef.value;
  if (!player) return;

  player.src = src;
  await player.load();
  seekTo(restoreTime);
};

watch(
  () => props.initialTime,
  (seconds) => {
    if (seconds > 0) {
      seekTo(seconds);
    }
  },
  { immediate: true },
);

watch(
  () => props.src,
  (value) => {
    const player = videoRef.value;
    if (!player) return;
    player.src = value;
  },
);

onMounted(() => {
  const player = videoRef.value;
  if (!player) return;
  player.src = props.src;
  if (props.initialTime > 0) {
    seekTo(props.initialTime);
  }
});

defineExpose({
  pause,
  getCurrentTime,
  getDuration,
  seekTo,
  setSource,
});
</script>

<template>
  <video
    ref="videoRef"
    :poster="poster"
    controls
    style="width: 100%; border-radius: 8px; background: #000"
    @timeupdate="onTimeUpdate"
    @play="onPlay"
    @pause="onPause"
    @seeking="onSeeking"
  />
  <el-alert
    v-if="blocked"
    title="Tabga qayting, video pause qilindi"
    type="warning"
    :closable="false"
    show-icon
    style="margin-top: 8px"
  />
</template>
