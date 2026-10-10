# TransitHub 界面规范

本文件约束所有路由的视觉层。采用 Naive UI 的主题、页面标题、卡片、表单、提示与状态组件，按数据用途调整布局。

- 风格：modern-minimal，管理工作台。优先暗色主题，兼容浅色主题。
- 字体：沿用 Segoe UI / Microsoft YaHei 系统字体；数值使用等宽数字，标识和代码使用系统等宽字体。
- 色彩：沿用蓝色主色。背景、内容面板、浮层依次提亮；成功、警告、错误色仅表达真实状态。
- 层级：管理导航为 NMenu；顶部展示工作区与面包屑；页面使用 NPageHeader；数据与配置区域使用 NCard。每个页面只有一个主标题。
- 间距：4px 基准；控件间距 8px，面板内部 16/20px，区块间距 20/24px；页面边距 16/24/32px。
- 圆角：输入框和按钮 6px，面板 10px。普通卡片不用重阴影，浮层使用统一阴影。
- 仪表盘：指标、经营趋势、资金状态、异常信息分层；状态信息降低权重。
- 数据列表：标题、工具栏、数据面板、分页各占一层；筛选项可换行，表格仅在自身容器内横向滚动。
- 配置页：左对齐页签，配置按内容分区，保存操作靠近对应表单。
- 排行榜：紧凑前三名与完整排名；去除大面积金银铜背景。
- 抽奖：列表与详情构成主从布局，状态、日程、奖品和操作分开组织。
- 工作区：左对齐说明，简洁的工作区卡片和新增入口；真实当前状态使用 NTag。
- 登录：独立工具栏、品牌说明、NCard 表单；使用 NFormItem、明确的字段标签、NAlert 状态。
- 嵌入页：保持全宽和宿主提供的主题参数；沿用管理端字体、面板和空状态。
- 动效：150–180ms 的颜色和透明度变化；不对管理页面进行位移入场；尊重 reduced-motion。
- 响应式：验证 320、375、414、768、1440px。工具栏换行，主从布局在移动端堆叠，正文不截断，文档无横向溢出。
- 路由：/login；/admin；/admin/upstream；/admin/group-rates；/admin/group-associations；/admin/connection-health；/admin/group-rate-campaigns；/admin/settings；/admin/tickets；/admin/leaderboard；/admin/lottery；/admin/mass-email；/admin/accounts；/embed/tickets；/embed/leaderboard；/embed/lottery。
- / 和 /register 为现有登录跳转；不新增页面、不改变接口和业务流程。

色彩和尺寸统一定义在 globals.css；Naive UI 主题在 styles/naiveTheme.ts 中读取同一组 token。新增样式使用命名变量。
