import { ElMessage } from 'element-plus';

export const notifyError = (message: string): void => {
  ElMessage.error(message);
};

export const notifySuccess = (message: string): void => {
  ElMessage.success(message);
};
