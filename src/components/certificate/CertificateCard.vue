<script setup lang="ts">
import dayjs from 'dayjs';

import type { StudentCertificateResponse } from '@/app/types/certificate';

const props = defineProps<{
  cert: StudentCertificateResponse;
}>();

const emit = defineEmits<{
  download: [url: string];
  verify: [url: string];
  copy: [serial: string];
}>();
</script>

<template>
  <el-card shadow="never">
    <template #header>Certificate</template>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="Serial">{{ props.cert.serial }}</el-descriptions-item>
      <el-descriptions-item label="Issued at">{{ dayjs(props.cert.issuedAt).format('YYYY-MM-DD HH:mm') }}</el-descriptions-item>
      <el-descriptions-item label="Revoked at">
        {{ props.cert.revokedAt ? dayjs(props.cert.revokedAt).format('YYYY-MM-DD HH:mm') : '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-space style="margin-top: 12px">
      <el-button :disabled="!props.cert.pdfUrl" type="primary" @click="props.cert.pdfUrl && emit('download', props.cert.pdfUrl)">
        Download PDF
      </el-button>
      <el-button @click="emit('verify', props.cert.verifyUrl)">Verify</el-button>
      <el-button @click="emit('copy', props.cert.serial)">Copy serial</el-button>
    </el-space>
  </el-card>
</template>
