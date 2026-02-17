<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

import { progressApi } from '@/app/api/progress.api';
import type { CompletionRulesUpdateRequest } from '@/app/types/progress';
import { notifyError, notifySuccess } from '@/utils/notify';

const route = useRoute();
const courseId = Number(route.params.courseId);

const loading = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

const form = reactive<CompletionRulesUpdateRequest>({
  minAttendancePct: 70,
  minVideoPct: 70,
  minTestScorePct: 60,
});

const rules: FormRules<CompletionRulesUpdateRequest> = {
  minAttendancePct: [{ required: true, message: 'Required', trigger: 'change' }],
  minVideoPct: [{ required: true, message: 'Required', trigger: 'change' }],
  minTestScorePct: [{ required: true, message: 'Required', trigger: 'change' }],
};

const loadRules = async (): Promise<void> => {
  loading.value = true;
  try {
    const rulesRes = await progressApi.adminGetCompletionRules(courseId);
    form.minAttendancePct = rulesRes.minAttendancePct;
    form.minVideoPct = rulesRes.minVideoPct;
    form.minTestScorePct = rulesRes.minTestScorePct;
  } catch (error) {
    notifyError((error as Error).message || 'Failed to load completion rules');
  } finally {
    loading.value = false;
  }
};

const save = async (): Promise<void> => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    await ElMessageBox.confirm('Change completion rules?', 'Confirm', { type: 'warning' });
  } catch {
    return;
  }

  saving.value = true;
  try {
    await progressApi.adminUpdateCompletionRules(courseId, {
      minAttendancePct: form.minAttendancePct,
      minVideoPct: form.minVideoPct,
      minTestScorePct: form.minTestScorePct,
    });
    notifySuccess('Completion rules updated');
  } catch (error) {
    notifyError((error as Error).message || 'Failed to update completion rules');
  } finally {
    saving.value = false;
  }
};

await loadRules();
</script>

<template>
  <section>
    <h2>Completion Rules</h2>
    <el-card>
      <el-skeleton v-if="loading" :rows="5" animated />
      <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="Min attendance %" prop="minAttendancePct">
          <el-input-number v-model="form.minAttendancePct" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="Min video %" prop="minVideoPct">
          <el-input-number v-model="form.minVideoPct" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="Min test score %" prop="minTestScorePct">
          <el-input-number v-model="form.minTestScorePct" :min="0" :max="100" />
        </el-form-item>
        <el-button type="primary" :loading="saving" @click="save">Save rules</el-button>
      </el-form>
    </el-card>
  </section>
</template>
