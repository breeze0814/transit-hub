<script setup lang="ts">
import { computed, h, ref, onMounted, onBeforeUnmount, watch, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NAvatar, NBreadcrumb, NBreadcrumbItem, NDropdown, NDrawer, NDrawerContent, NTag, type MenuOption } from 'naive-ui'
import { LayoutDashboard, Network, Settings, LogOut, Globe, Moon, Sun, Percent, Megaphone, ChevronDown, ArrowRightLeft, FolderTree, Link2, Activity, MessageSquare, Github, Mail, Menu, X, Trophy, Gift, Boxes } from 'lucide-vue-next'
import { useDark, useToggle, useMediaQuery } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useAdminAccounts } from '../composables/useAdminAccounts'
import { clearAccessToken } from '@/modules/auth/api/auth'
import { getSystemVersion } from '../api/system'
import type { SystemVersionResponse } from '../api/system'
import logoUrl from '@/assets/logo.png'
import AdminNavigation from './AdminNavigation.vue'

const route = useRoute()
const router = useRouter()

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  initialValue: 'dark',
  storageKey: 'transithub-color-scheme',
})
const toggleDark = useToggle(isDark)

const { t, locale } = useI18n()
const toggleLocale = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

const { currentAccount, noticeKey, loadCurrentAccount } = useAdminAccounts()

// 版本信息：开源版仅用于纯展示，不依赖授权/更新服务
const versionInfo = ref<SystemVersionResponse | null>(null)

const loadVersionInfo = async () => {
  try {
    versionInfo.value = await getSystemVersion()
  } catch {
    // 版本信息加载失败不阻塞页面
  }
}

// GitHub 仓库地址是本项目唯一来源，版本号链接和图标入口都从这里派生，避免散落硬编码。
const githubRepoUrl = 'https://github.com/deviseo/transit-hub'
const githubReleasesUrl = `${githubRepoUrl}/releases`

// 非正式发布的占位版本号（本地预览/开发/未设置 APP_VERSION 时的默认值）不对应真实 tag，
// 点击后退回 release 列表页，而不是跳到一个不存在的 tag 地址。
const nonReleaseVersionPlaceholders = ['latest', 'local-preview', 'dev', '0.0.0']

const versionLabel = computed(() => {
  const version = versionInfo.value?.version.trim()
  if (!version) return ''
  const bareVersion = version.replace(/^v+/i, '')
  return bareVersion ? `v${bareVersion}` : ''
})

const releaseUrl = computed(() => {
  const version = versionInfo.value?.version.trim()
  if (!version) return githubReleasesUrl
  if (nonReleaseVersionPlaceholders.includes(version)) return githubReleasesUrl
  return versionLabel.value ? `${githubReleasesUrl}/tag/${versionLabel.value}` : githubReleasesUrl
})

// 工作区选择页不显示侧边栏和业务菜单
const isWorkspaceSelectionPage = computed(() => route.name === 'AdminAccounts')

const showUserMenu = ref(false)
const isMobileSidebarOpen = ref(false)
const isDesktop = useMediaQuery('(min-width: 1024px)')

const openMobileSidebar = () => {
  isMobileSidebarOpen.value = true
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeMobileSidebar()
  showUserMenu.value = false
}

onMounted(() => {
  void loadCurrentAccount()
  void loadVersionInfo()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const goToAccounts = () => {
  showUserMenu.value = false
  closeMobileSidebar()
  router.push('/admin/accounts')
}

// 二级菜单项：带独立小图标，方便在展开态下快速区分。
interface MenuChild {
  name: string
  path: string
  icon: Component
}

// 菜单项分两种形态：叶子（单一路由入口）和分组（固定顺序的二级菜单集合）。
// “分组管理”下的三个二级菜单顺序固定：分组倍率 -> 分组关联 -> 分组健康，不随业务改动调整。
type MenuEntry =
  | { type: 'leaf'; name: string; path: string; icon: Component }
  | { type: 'group'; id: string; name: string; icon: Component; children: MenuChild[] }

const menuItems = computed<MenuEntry[]>(() => [
  { type: 'leaf', name: t('admin.menu.dashboard'), path: '/admin', icon: LayoutDashboard },
  { type: 'leaf', name: t('admin.menu.upstream'), path: '/admin/upstream', icon: Network },
  {
    type: 'group',
    id: 'group-management',
    name: t('admin.menu.groupManagement'),
    icon: FolderTree,
    children: [
      { name: t('admin.menu.groupRates'), path: '/admin/group-rates', icon: Percent },
      { name: t('admin.menu.groupAssociations'), path: '/admin/group-associations', icon: Link2 },
      { name: t('admin.menu.connectionHealth'), path: '/admin/connection-health', icon: Activity },
    ],
  },
  { type: 'leaf', name: t('admin.menu.massEmail'), path: '/admin/mass-email', icon: Mail },
  {
    type: 'group',
    id: 'embedded-features',
    name: t('admin.menu.sub2apiFeatures'),
    icon: Boxes,
    children: [
      { name: t('admin.menu.leaderboard'), path: '/admin/leaderboard', icon: Trophy },
      { name: t('admin.menu.lottery'), path: '/admin/lottery', icon: Gift },
      { name: t('admin.menu.groupRateCampaigns'), path: '/admin/group-rate-campaigns', icon: Megaphone },
      { name: t('admin.menu.tickets'), path: '/admin/tickets', icon: MessageSquare },
    ],
  },
  { type: 'leaf', name: t('admin.menu.settings'), path: '/admin/settings', icon: Settings },
])

// 分组展开状态：未手动切换过时，按当前路由是否命中该分组的子项自动展开。
const expandedGroups = ref<Record<string, boolean>>({})

const isGroupActive = (group: Extract<MenuEntry, { type: 'group' }>) => group.children.some((child) => child.path === route.path)

const isGroupExpanded = (group: Extract<MenuEntry, { type: 'group' }>) => {
  const manual = expandedGroups.value[group.id]
  return manual === undefined ? isGroupActive(group) : manual
}

const handleMenuRouteClick = () => {
  closeMobileSidebar()
}

const navigationOptions = computed<MenuOption[]>(() => menuItems.value.map(item => item.type === 'leaf' ? {
  key: item.path,
  label: () => h(RouterLink, { to: item.path, onClick: handleMenuRouteClick }, () => item.name),
  icon: () => h(item.icon),
} : {
  key: item.id,
  label: item.name,
  icon: () => h(item.icon),
  children: item.children.map(child => ({
    key: child.path,
    label: () => h(RouterLink, { to: child.path, onClick: handleMenuRouteClick }, () => child.name),
    icon: () => h(child.icon),
  })),
}))
const navigationExpandedKeys = computed(() => menuItems.value.filter((item): item is Extract<MenuEntry, { type: 'group' }> => item.type === 'group' && isGroupExpanded(item)).map(item => item.id))
const updateNavigationExpandedKeys = (keys: string[]) => {
  for (const item of menuItems.value) if (item.type === 'group') expandedGroups.value[item.id] = keys.includes(item.id)
}

// 摊平查找当前路由对应的菜单文案，供顶部标题使用（叶子和分组子项都要能查到）。
const findMenuLabel = (path: string): string | undefined => {
  for (const item of menuItems.value) {
    if (item.type === 'leaf' && item.path === path) return item.name
    if (item.type === 'group') {
      const child = item.children.find((c) => c.path === path)
      if (child) return child.name
    }
  }
  return undefined
}

const pageTitle = computed(() => (route.path === '/admin' ? t('admin.menu.dashboard') : findMenuLabel(route.path) ?? ''))

const handleLogout = () => {
  showUserMenu.value = false
  closeMobileSidebar()
  clearAccessToken()
  router.push('/login')
}

const userMenuOptions = computed(() => [
  {
    key: 'identity',
    type: 'render' as const,
    render: () => h('div', { class: 'px-3 py-2 text-sm' }, [
      h('div', { class: 'font-medium' }, currentAccount.value?.displayName ?? ''),
      h('div', { class: 'mt-1 text-xs text-muted-foreground' }, currentAccount.value ? `${currentAccount.value.platform} · ${currentAccount.value.identity}` : ''),
    ]),
  },
  { key: 'divider', type: 'divider' as const },
  { key: 'workspaces', label: t('admin.layout.switchWorkspace'), icon: () => h(ArrowRightLeft, { class: 'h-4 w-4' }) },
  { key: 'logout', label: t('admin.menu.signOut'), icon: () => h(LogOut, { class: 'h-4 w-4' }) },
])

const selectUserMenu = (key: string) => {
  if (key === 'workspaces') goToAccounts()
  else if (key === 'logout') handleLogout()
}

watch(
  () => route.fullPath,
  () => {
    closeMobileSidebar()
  },
)
</script>

<template>
  <div class="flex h-dvh overflow-hidden overflow-x-hidden bg-background text-foreground">
    <a
      href="#admin-main-content"
      class="sr-only fixed left-3 top-3 z-[70] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      {{ t('admin.layout.skipToContent') }}
    </a>
    <aside v-if="!isWorkspaceSelectionPage && isDesktop" class="app-admin-sidebar shrink-0 border-r border-border/40">
      <AdminNavigation
        :options="navigationOptions"
        :selected="route.path"
        :expanded-keys="navigationExpandedKeys"
        @update:expanded-keys="updateNavigationExpandedKeys"
        @logout="handleLogout"
      />
    </aside>
    <NDrawer
      v-if="!isDesktop && !isWorkspaceSelectionPage"
      v-model:show="isMobileSidebarOpen"
      placement="left"
      width="min(280px, 100vw)"
      :z-index="100"
    >
      <NDrawerContent :body-content-style="{ padding: '0', height: '100%' }" :native-scrollbar="false">
        <AdminNavigation
          id="admin-mobile-sidebar"
          mobile
          :options="navigationOptions"
          :selected="route.path"
          :expanded-keys="navigationExpandedKeys"
          @update:expanded-keys="updateNavigationExpandedKeys"
          @close="closeMobileSidebar"
          @logout="handleLogout"
        />
      </NDrawerContent>
    </NDrawer>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 w-full">
      <!-- Header: 工作区选择页不显示业务导航头 -->
      <header
        v-if="!isWorkspaceSelectionPage"
        class="app-topbar flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-3 sm:px-6"
      >
        <div class="flex min-w-0 items-center gap-2">
          <UiButton
            attr-type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            :aria-label="t('admin.layout.openNavigation')"
            :aria-expanded="isMobileSidebarOpen"
            aria-controls="admin-mobile-sidebar"
            @click="openMobileSidebar"
          >
            <Menu class="h-4 w-4" />
          </UiButton>
          <NBreadcrumb class="min-w-0 truncate">
            <NBreadcrumbItem class="hidden md:inline" @click="goToAccounts">{{ currentAccount?.displayName || t('brand.name') }}</NBreadcrumbItem>
            <NBreadcrumbItem>{{ pageTitle }}</NBreadcrumbItem>
          </NBreadcrumb>
        </div>

        <div class="flex min-w-0 shrink-0 items-center gap-1 sm:gap-4">
          <div class="flex items-center gap-1 sm:gap-2">
            <!-- 版本号展示：点击跳转到对应 GitHub release（非正式发布占位版本号退回 releases 列表）。 -->
            <n-tag
              v-if="versionInfo"
              :bordered="false"
              size="small"
              :href="releaseUrl"
              tag="a"
              target="_blank"
              rel="noopener noreferrer"
              class="hidden sm:flex items-center gap-1 text-xs font-semibold no-underline"
              :title="t('admin.system.openRelease')"
              :aria-label="t('admin.system.openRelease')"
            >
              {{ versionLabel }}
            </n-tag>

            <UiButton
              quaternary
              circle
              size="small"
              :href="githubRepoUrl"
              tag="a"
              target="_blank"
              rel="noopener noreferrer"
              :title="t('admin.system.openGithubRepository')"
              :aria-label="t('admin.system.openGithubRepository')"
            >
              <Github class="h-4 w-4" />
            </UiButton>

            <UiButton
              quaternary
              circle
              size="small"
              @click="toggleLocale"
              :title="t('admin.layout.toggleLanguage')"
              :aria-label="t('admin.layout.toggleLanguage')"
            >
              <Globe class="h-4 w-4" />
            </UiButton>
            <UiButton
              quaternary
              circle
              size="small"
              @click="toggleDark()"
              :title="t('admin.layout.toggleTheme')"
              :aria-label="t('admin.layout.toggleTheme')"
            >
              <Moon v-if="!isDark" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
            </UiButton>
          </div>

          <NDropdown
            trigger="click"
            placement="bottom-end"
            :options="userMenuOptions"
            :show="showUserMenu"
            @update:show="showUserMenu = $event"
            @select="selectUserMenu"
          >
            <UiButton
              class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-elevated transition-colors"
              :aria-label="t('admin.layout.userProfile')"
              :aria-expanded="showUserMenu"
            >
              <NAvatar :size="28" round class="shrink-0">
                {{ currentAccount?.displayName?.slice(0, 1) || 'T' }}
              </NAvatar>
              <span
                v-if="currentAccount"
                class="text-sm font-medium text-foreground max-w-[120px] truncate hidden sm:inline"
                >{{ currentAccount.displayName }}</span
              >
              <ChevronDown class="h-3.5 w-3.5 text-muted-foreground" />
            </UiButton>
          </NDropdown>
        </div>
      </header>

      <!-- Content Area -->
      <main
        id="admin-main-content"
        class="min-h-0 flex-1 overflow-auto"
        :class="isWorkspaceSelectionPage ? '' : 'app-main'"
        tabindex="-1"
      >
        <NAlert v-if="!isWorkspaceSelectionPage && noticeKey" type="warning" class="mb-4">
          {{ t(noticeKey) }}
        </NAlert>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
