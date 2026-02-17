<script setup lang="ts">
import AppShell from '@/components/AppShell.vue';

const menuItems = [
  { index: '/admin/dashboard', label: 'Dashboard' },
  { index: '/admin/users', label: 'Users' },
  { index: '/admin/courses', label: 'Courses' },
  { index: '/admin/enrollment', label: 'Enrollments' },
];
</script>

<template>
  <AppShell title="Admin Panel" :menu-items="menuItems" />
</template>
