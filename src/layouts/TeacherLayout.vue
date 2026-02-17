<script setup lang="ts">
import AppShell from '@/components/AppShell.vue';

const menuItems = [
  { index: '/teacher/dashboard', label: 'Dashboard' },
  { index: '/teacher/courses', label: 'Courses' },
];
</script>

<template>
  <AppShell title="Teacher Panel" :menu-items="menuItems" />
</template>
