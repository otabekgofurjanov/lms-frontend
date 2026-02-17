<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

import { certificateApi } from '@/app/api/certificate.api';
import type { PublicCertificateVerifyResponse } from '@/app/types/certificate';

const route = useRoute();
const router = useRouter();
const serial = String(route.params.serial || '');

const loading = ref(false);
const data = ref<PublicCertificateVerifyResponse | null>(null);

const load = async (): Promise<void> => {
  loading.value = true;
  try {
    data.value = await certificateApi.publicVerifyCertificate(serial);
  } finally {
    loading.value = false;
  }
};

await load();
</script>

<template>
  <section>
    <el-skeleton v-if="loading" :rows="5" animated />
    <el-result
      v-else-if="data?.status === 'VALID'"
      icon="success"
      title="Certificate Valid"
      :sub-title="`${data.studentFullName} • ${data.courseTitle}`"
    >
      <template #extra>
        <p>Serial: {{ data.serial }}</p>
        <p>Issued: {{ data.issuedAt ? dayjs(data.issuedAt).format('YYYY-MM-DD HH:mm') : '-' }}</p>
        <el-button type="primary" @click="router.push('/login')">Back to login</el-button>
      </template>
    </el-result>

    <el-result
      v-else-if="data?.status === 'REVOKED'"
      icon="warning"
      title="Certificate Revoked"
      :sub-title="`Serial: ${data.serial}`"
    >
      <template #extra>
        <p>Revoked: {{ data.revokedAt ? dayjs(data.revokedAt).format('YYYY-MM-DD HH:mm') : '-' }}</p>
        <el-button type="primary" @click="router.push('/login')">Back to login</el-button>
      </template>
    </el-result>

    <el-result
      v-else-if="data?.status === 'TAMPERED'"
      icon="error"
      title="Certificate Tampered"
      sub-title="Certificate integrity check failed"
    >
      <template #extra>
        <el-button type="primary" @click="router.push('/login')">Back to login</el-button>
      </template>
    </el-result>

    <el-result v-else icon="error" title="Certificate Not Found" sub-title="Invalid or unknown serial">
      <template #extra>
        <el-button type="primary" @click="router.push('/login')">Back to login</el-button>
      </template>
    </el-result>
  </section>
</template>
