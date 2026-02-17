<script setup lang="ts">
import { computed } from 'vue';

import { useAuthStore } from '@/app/store/auth.store';

const authStore = useAuthStore();
const roles = computed(() => authStore.user?.roles.join(', ') || '-');
</script>

<template>
  <el-card>
    <h2>Student Dashboard</h2>
    <p>Welcome, {{ authStore.user?.fullName }}</p>
    <p>Roles: {{ roles }}</p>
  </el-card>
</template>
