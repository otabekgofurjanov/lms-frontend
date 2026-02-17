import 'vue-router';

import type { Role } from '@/app/types/auth';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Role[];
  }
}
