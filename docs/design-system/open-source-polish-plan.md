# 开源打磨计划（第 1 步）

> 本地决策文档，待确认后再动手。

## 现状盘点

| 项目 | 现状 | 影响 |
| --- | --- | --- |
| `LICENSE` | 根目录和各包目录都没有；三个 npm 包的 `package.json` 声明了 MIT | npm 包不含许可证全文；GitHub 显示"无许可证"，严格的公司不会引入 |
| `CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` / `SECURITY.md` | 都没有 | GitHub 社区健康度不完整；外部贡献者不知道流程 |
| Issue / PR 模板 | 没有 | 报告质量不稳定 |
| 私密漏洞报告 | 仓库设置里是关闭的，但 `support-governance.md` 让大家用它报漏洞 | 文档里写的上报途径实际不存在 |
| GitHub 仓库信息 | 主页仍是 `atom63-docs.vercel.app`；没有 topics；描述很简短 | 搜索不到；主页链接是旧的 |
| 根 `README.md` | 以内部视角为主（"抽离状态""发布需审批"），缺少介绍、快速上手、徽章 | 外部访客看不出这是什么、怎么用 |
| `packages/ui-ios/package.json` | 没有 `license` 字段（私有包，不发布到 npm） | SwiftPM 使用方依赖根目录的 LICENSE |
| 敏感文件 | `.env.local`、`.vercel`、`output`、`.build` 都在 gitignore 中，未提交 | 无问题 |
| 示例 | 三个示例都有 README | 无问题 |
| 第三方代码 | shadcn / Radix 只在注释中作为兼容说明出现，未发现复制的第三方代码或字体、图片 | 暂不需要第三方声明（见决策 5） |

## 执行计划（不需要拍板的部分）

1. **许可证**：根目录加 MIT `LICENSE`；复制到 `packages/styles`、`packages/ui-foundation`、`packages/ui-react`，因为 npm 只打包包目录内的 LICENSE。用打包冒烟测试确认三个 tarball 都包含它。
   → 验证：`pnpm check:ds-pack-smoke`，并用 `tar -tzf` 检查。
2. **社区文件**：
   - `CONTRIBUTING.md`：环境要求、开发命令、changeset 流程、提交前检查、PR 规范（从现有 README 和 `support-governance.md` 整理，不另立新规则）。
   - `CODE_OF_CONDUCT.md`：Contributor Covenant 2.1。
   - `SECURITY.md`：支持的版本、私密上报途径、响应时间（沿用 `support-governance.md` 的说法）。
   - `.github/ISSUE_TEMPLATE/`：bug、无障碍问题、组件提案三个表单，加 `config.yml`（关闭空白 issue，链接到文档站和安全上报）。
   - `.github/pull_request_template.md`：摘要、验证、changeset 检查项。
   → 验证：`format:check` 通过；GitHub Community Standards 页面全部打勾。
3. **README 重写**：一句话定位；徽章（npm 版本、CI、许可证）；三端（Web React、iOS SwiftUI、Figma 插件）共用一套 token 的说明；最小可运行的快速上手代码；包列表；文档站链接；贡献和许可证。现有的"验证"和"仓库状态"两节移到 `CONTRIBUTING.md` 和 `docs/`。
   → 验证：README 里的快速上手代码在空项目里从 npm 安装后能跑通。
4. **包元数据**：`packages/ui-ios/package.json` 补 `"license": "MIT"`。
5. **提交方式**：以上作为一个 PR 提交到 DS 仓库，不直接推 `main`。

## 需要你拍板的决策

### 决策 1：LICENSE 的版权方写谁

- **背景**：MIT 许可证第一行是 `Copyright (c) <年份> <版权方>`。仓库所有提交的作者都是 `ATOM63 <yz.atom63@gmail.com>`，README 末尾写的是 "Built by You Zhang"。
- **选项**：
  - A. `Copyright (c) 2026 You Zhang`：个人持有，最简单。
  - B. `Copyright (c) 2026 ATOM63`：以品牌或工作室持有，前提是 ATOM63 是你打算长期使用的名义。
  - C. `Copyright (c) 2026 You Zhang (ATOM63)`：两者都写。
- **权衡**：法律上版权方应该是实际权利人。如果 ATOM63 不是注册主体，写个人名字最稳妥；C 兼顾了品牌露出。
- **推荐**：C。

### 决策 2：行为准则和安全问题的联系邮箱

- **背景**：Contributor Covenant 要求写一个接收违规举报的联系方式；`SECURITY.md` 在私密漏洞报告不可用时也需要一个备用邮箱。这个邮箱会公开。
- **选项**：
  - A. 用提交作者邮箱 `yz.atom63@gmail.com`。
  - B. 新建一个专用地址（例如 `security@atom63.io` 或 `oss@atom63.io`），需要你先配置好收件。
  - C. 不写邮箱，只用 GitHub 私密漏洞报告；行为准则的举报也引导到那里。
- **权衡**：A 最快但会暴露个人邮箱；B 最规范但需要你配域名邮箱；C 不暴露邮箱，但行为准则举报走漏洞报告通道有点别扭。
- **推荐**：B；如果暂时配不了，就先用 A。

### 决策 3：打开 GitHub 私密漏洞报告

- **背景**：`support-governance.md` 已经让大家用这个途径，但它现在是关闭的。这是仓库的安全设置。
- **选项**：
  - A. 你在 Settings → Code security → Private vulnerability reporting 里自己打开。
  - B. 你授权我用 `gh api` 打开。
- **推荐**：A（安全设置由你操作）。

### 决策 4：更新 GitHub 仓库信息

- **背景**：主页链接过时、没有 topics。修改会公开显示在仓库页面上。
- **拟改内容**：
  - 描述：`One token architecture for React, SwiftUI and Figma — the Atom63 design system.`
  - 主页：`https://system.atom63.io`
  - Topics：`design-system`、`design-tokens`、`react`、`swiftui`、`tailwindcss`、`figma-plugin`、`ui-components`
- **选项**：A. 我用 `gh repo edit` 改；B. 你在网页上改；C. 调整文案后再改。
- **推荐**：A。

### 决策 5：是否加 shadcn/ui 致谢

- **背景**：部分组件的 API 和 CSS 变量兼容 shadcn/ui 的约定，`@atom63/styles/compat/shadcn` 专门做了桥接。代码里没发现直接复制的 shadcn 源码，所以法律上不需要附带它的许可证。
- **选项**：
  - A. README 里加一节 Acknowledgements，致谢 shadcn/ui、Base UI、Tailwind CSS。
  - B. 不加。
- **推荐**：A。成本很低，也是开源社区的常规做法。

### 决策 6：README 末尾的 "Built by You Zhang through Hermes Agent."

- **选项**：A. 保留原样；B. 改成 "Created by You Zhang."；C. 删除（作者信息已在 LICENSE 和 package.json 中）。
- **推荐**：B。

## 决策结论（2026-09-23）

1. 版权方：`Copyright (c) 2026 You Zhang (ATOM63)`。
2. 联系邮箱：不公开邮箱。安全问题只走 GitHub 私密漏洞报告；行为准则举报同样引导到私密报告通道。
3. 私密漏洞报告：已用 `gh api` 打开。
4. 仓库描述、主页、topics：按拟改内容更新。
5. README 加 Acknowledgements，致谢 shadcn/ui、Base UI、Tailwind CSS。
6. README 结尾改为 "Created by You Zhang."
