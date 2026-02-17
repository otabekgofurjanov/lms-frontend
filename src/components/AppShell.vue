<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/app/store/auth.store';

interface MenuItem {
  index: string;
  label: string;
}

defineProps<{
  title: string;
  menuItems: MenuItem[];
}>();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const activePath = computed(() => route.path);

const onSelect = async (path: string): Promise<void> => {
  await router.push(path);
};

const onLogout = async (): Promise<void> => {
  await authStore.logout();
};
</script>

<template>
  <el-container class="app-shell">
    <el-aside width="220px" class="app-shell__aside">
      <h2>{{ title }}</h2>
      <el-menu :default-active="activePath" @select="onSelect">
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-shell__header">
        <span>{{ authStore.user?.fullName }}</span>
        <el-button type="danger" plain @click="onLogout">Logout</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__aside {
  background: #111827;
  color: #fff;
  padding: 16px;
}

.app-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
</style>
