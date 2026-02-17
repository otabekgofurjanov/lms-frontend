<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadFile, UploadFiles } from 'element-plus';

import { adminUsersApi } from '@/app/api/admin.users.api';
import type { ImportResult } from '@/app/types/users';
import { notifyError, notifySuccess } from '@/utils/notify';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const loading = ref(false);
const selectedFile = ref<File | null>(null);
const result = ref<ImportResult | null>(null);

const close = (): void => {
  emit('update:modelValue', false);
  selectedFile.value = null;
  loading.value = false;
};

const onChange = (file: UploadFile, _files: UploadFiles): void => {
  selectedFile.value = file.raw ?? null;
};

const submit = async (): Promise<void> => {
  if (!selectedFile.value) {
    notifyError('Please select CSV file first');
    return;
  }

  loading.value = true;
  try {
    result.value = await adminUsersApi.importUsersCsv(selectedFile.value);
    notifySuccess('CSV import completed');
    emit('success');
  } catch (error) {
    notifyError((error as Error).message || 'CSV import failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <el-dialog :model-value="props.modelValue" title="Import users from CSV" width="700px" @close="close">
    <el-alert type="info" :closable="false" show-icon>
      <template #title>CSV columns: fullName,email,phone,role</template>
    </el-alert>

    <el-upload
      drag
      action="#"
      accept=".csv"
      :auto-upload="false"
      :limit="1"
      :on-change="onChange"
      class="import-upload"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">Drop CSV here or <em>click to upload</em></div>
    </el-upload>

    <el-row v-if="result" :gutter="12" class="summary-row">
      <el-col :span="6"><el-statistic title="Total" :value="result.total" /></el-col>
      <el-col :span="6"><el-statistic title="Created" :value="result.created" /></el-col>
      <el-col :span="6"><el-statistic title="Updated" :value="result.updated" /></el-col>
      <el-col :span="6"><el-statistic title="Failed" :value="result.failed" /></el-col>
    </el-row>

    <el-card v-if="result && result.errors.length" class="error-list" shadow="never">
      <template #header>Import errors</template>
      <ul>
        <li v-for="(error, index) in result.errors" :key="`${index}-${error}`">{{ error }}</li>
      </ul>
    </el-card>

    <template #footer>
      <el-space>
        <el-button @click="close">Close</el-button>
        <el-button type="primary" :loading="loading" @click="submit">Upload</el-button>
      </el-space>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-upload {
  margin-top: 16px;
}

.summary-row {
  margin: 20px 0;
}

.error-list {
  max-height: 180px;
  overflow: auto;
}
</style>
