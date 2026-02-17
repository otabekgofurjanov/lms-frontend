<template>
  <div class="state-page">
    <el-result icon="info" title="404" sub-title="Page not found.">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">Back Home</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.state-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
