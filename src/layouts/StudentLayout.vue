<script setup lang="ts">
import AppShell from '@/components/AppShell.vue';

const menuItems = [
  { index: '/student/dashboard', label: 'Dashboard' },
  { index: '/student/courses', label: 'My Courses' },
];
</script>

<template>
  <AppShell title="Student Panel" :menu-items="menuItems" />
</template>
