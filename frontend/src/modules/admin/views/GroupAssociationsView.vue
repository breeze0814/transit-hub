<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import GroupAssociationsPanel from '../components/dashboard/GroupAssociationsPanel.vue'
const { t } = useI18n()
</script>

<template>
  <div class="app-page app-page--group-associations space-y-6">
    <AppPageHeader :title="t('admin.menu.groupAssociations')" :description="t('ui.pages.groupAssociations')" />
    <GroupAssociationsPanel />
  </div>
</template>
