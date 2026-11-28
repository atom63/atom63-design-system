# CRM visual benchmark: three-sample rerun after fix round 4

The same CRM reference, brief, capture matrix and blinded visual rubric as the [2026-11-03 synthesis](vibe-crm-three-sample-synthesis-2026-11-03.md), rerun three times on main `eede465a` (the 0.2.0-beta.16 release, after readiness fix rounds 1-4). Same Codex CLI (0.169.0) and default model family.

## Result

| Arm | 2026-11-03 scores | Mean | 2026-11-22 scores | Mean | Change |
| --- | --- | ---: | --- | ---: | ---: |
| plain | 94, 95, 92 | 93.7 | 89, 91, 92 | 90.7 | -3.0 |
| ds-core | 79, 64, 78 | 73.7 | 83, 90, 89 | 87.3 | +13.6 |
| ds-guided | 85, 61, 84 | 76.7 | 90, 86, 81 | 85.7 | +9.0 |

The gap between plain and the design-system arms fell from about 17-20 points to about 3-5. In sample 1, ds-guided scored above plain (90 against 89). The DS arms are also steadier: the range fell from 15 to 7 for ds-core and from 24 to 9 for ds-guided, and no sample repeated the 61-64 collapse of 2026-11-03 sample 2.

Plain still has the best mean. Three samples are enough to show the gap shrank; they are not enough to claim the design system now matches or beats plain on visual fidelity.

## Implementation measures (sample 3, the run whose full report survives)

| Measure | plain | ds-core | ds-guided |
| --- | --- | --- | --- |
| Craft violations | 73 | 2 | 2 |
| Literal colors | 77 | 0 | 0 |
| axe violations | 6 rules, 6 nodes | 0 | 18 rules, 26 nodes |
| System-component share | 0% | 47% | 67% |
| Type errors, build | 0, pass | 0, pass | 0, pass |

The design system keeps its implementation advantage (tokens, no literal colors, few craft violations), and ds-core reached zero axe violations. ds-guided still has accessibility findings, mostly `region` (content outside landmarks) and a `label-content-name-mismatch`; the template-driven arm composes more page chrome and leaves some of it outside landmarks.

## Caveats

- All three runs wrote to the same dated report, so only sample 3's full report and screenshots were kept in the repository ([vibe-2026-11-22-s3.md](vibe-2026-11-22-s3.md)). Samples 1 and 2 were scored from their preserved judge outputs; each sample's label-to-arm mapping was recovered by matching the judge's anonymous screenshots to each arm's own captures by content hash, and sample 3's recovered mapping matches its written report. Their craft and axe measures were not recovered. Future runs pass `--run-id` per sample.
- One CRM reference and one model family as builder and judge; same-family preference risk is unchanged. A different judge model or a human blind review remains the next check.
- What changed between the runs is broad (four fix rounds, template rule fixes, Table sorting and pagination, overlay accessibility), so this result does not attribute the gain to one change.

## Next

1. The ds-guided axe findings: make the templates' page chrome sit in landmarks, and look at the name mismatch.
2. Rerun with a different judge model or a human blind review.
3. Add a second reference (a portfolio or marketing page) so the benchmark is not only a dense CRM.

---

# CRM 视觉基准：第 4 轮修复后的三样本重跑

用和 [2026-11-03 综合结论](vibe-crm-three-sample-synthesis-2026-11-03.md) 完全相同的 CRM 参考、brief、截图矩阵和匿名视觉评分标准，在 main `eede465a`（0.2.0-beta.16 发布，readiness 第 1–4 轮修复之后）上重跑三次。Codex CLI 版本（0.169.0）和默认模型系列相同。

## 结果

| 组 | 11-03 分数 | 平均 | 11-22 分数 | 平均 | 变化 |
| --- | --- | ---: | --- | ---: | ---: |
| plain | 94、95、92 | 93.7 | 89、91、92 | 90.7 | −3.0 |
| ds-core | 79、64、78 | 73.7 | 83、90、89 | 87.3 | +13.6 |
| ds-guided | 85、61、84 | 76.7 | 90、86、81 | 85.7 | +9.0 |

plain 和两个设计系统组的差距从约 17–20 分缩小到约 3–5 分。第 1 次取样中 ds-guided 高于 plain（90 比 89）。设计系统组也更稳定：ds-core 的极差从 15 降到 7，ds-guided 从 24 降到 9，没有再出现 11-03 第 2 次那种 61–64 分的失分。

plain 的平均分仍然最高。三次取样足以说明差距缩小了，但不足以宣称设计系统在视觉还原上已经追平或超过 plain。

## 实现层面的指标（第 3 次，完整报告保留下来的那次）

| 指标 | plain | ds-core | ds-guided |
| --- | --- | --- | --- |
| craft 违规 | 73 | 2 | 2 |
| 字面颜色 | 77 | 0 | 0 |
| axe 违规 | 6 条规则、6 个节点 | 0 | 18 条规则、26 个节点 |
| 系统组件占比 | 0% | 47% | 67% |
| 类型错误、构建 | 0，通过 | 0，通过 | 0，通过 |

设计系统在实现上的优势保持住了（用 token、没有字面颜色、几乎没有 craft 违规），ds-core 的 axe 违规降到 0。ds-guided 仍有无障碍问题，主要是 `region`（内容不在 landmark 里）和一条 `label-content-name-mismatch`：用模板的那组搭了更多页面框架，其中一部分没放进 landmark。

## 说明

- 三次运行写进了同一个按日期命名的报告，所以仓库里只保留了第 3 次的完整报告和截图（[vibe-2026-11-22-s3.md](vibe-2026-11-22-s3.md)）。第 1、2 次的分数取自保留下来的评审输出；每次的「编号 → 组」对应关系，是把评审看到的匿名截图和各组自己的截图按内容哈希比对还原的，第 3 次还原的结果和它的报告一致。第 1、2 次的 craft 和 axe 指标没有还原。以后每次取样都加 `--run-id`。
- 只有一个 CRM 参考，构建和评审用同一个模型系列，同系列偏好的风险没有变。下一步仍是换一个评审模型或做人工盲评。
- 两次之间改动面很广（四轮修复、模板规则、Table 排序和分页、浮层无障碍），所以不能把提升归功于某一项改动。

## 下一步

1. 修 ds-guided 的 axe 问题：模板的页面框架要放进 landmark，再看名称不一致那条。
2. 换一个评审模型或人工盲评再跑一次。
3. 加第二个参考（作品集或营销页），让基准不只是一个数据密集的 CRM。
