# CRM visual benchmark: three-sample synthesis

Three independent Codex runs reconstructed the same Mobbin-grounded CRM reference with the same brief, capture matrix and blinded visual rubric. Each run produced three implementations across five states and four viewports.

## Result

| Arm | Scores | Mean | Median | Range |
| --- | --- | ---: | ---: | ---: |
| plain | 94, 95, 92 | 93.7 | 94 | 3 |
| ds-core | 79, 64, 78 | 73.7 | 78 | 15 |
| ds-guided | 85, 61, 84 | 76.7 | 84 | 24 |

The stable result is that plain reproduced this reference more faithfully in every sample. Atom63 improved implementation hygiene, but it did not make the visual result stronger or more reliable. The two DS arms were competitive on desktop; their losses came mainly from responsive composition and the selected/complete states. In sample 2, both DS implementations placed contact details over table content at tablet and phone widths. Samples 1 and 3 handled the same states much better, which explains most of the variance.

Guidance helped the typical visual result: ds-guided had a median of 84 versus 78 for ds-core. It did not establish a reliable advantage because guided also had the widest range and the worst single run. Three samples are enough to reject a claim that the current guidance consistently improves visual output, but not enough to estimate a precise long-term effect.

## What the design system is strong at

| Measure | plain | ds-core | ds-guided |
| --- | --- | --- | --- |
| Craft violations, three samples | 125, 124, 133 | 39, 76, 4 | 0, 49, 6 |
| Literal colors, three samples | 123, 113, 133 | 38, 33, 0 | 0, 10, 0 |
| System-component share | 0%, 0%, 0% | 61%, 56%, 80% | 45%, 33%, 41% |

Atom63 reliably moved implementations toward tokens and system components. Sample 3 shows that both DS arms can reach zero literal colors without sacrificing a coherent desktop result. This is real leverage, but it is leverage over implementation discipline rather than guaranteed visual fidelity.

Accessibility is not yet a strength of the generated result. Every arm in every sample had serious axe findings. The guided arm reached 237 nodes in sample 2, including critical ARIA structure failures and nested interactive controls. Supplying accessible primitives did not prevent invalid composition.

## Decision

Do not add more generic components or tokens in response to this benchmark. The next intervention should be a narrow responsive-composition slice for dense list/detail products:

1. Add a reviewed table-to-mobile-list pattern with explicit column priority.
2. Define tablet side-panel and phone detail-overlay behavior, including full-document coverage, scroll containment, inset, stacking and close behavior.
3. Add selected, empty, importing and complete examples at desktop, tablet and phone widths.
4. Add guidance and checks that prevent nested interactive rows and invalid ARIA table composition.
5. Repeat this benchmark after the slice, then use a different judge model or human blind review to reduce same-family preference risk.

The evidence is specific to one CRM reference and one Codex model family. It tests reconstruction strength, not the full design system or general product creativity. Across the three samples, Codex used 8,702,061 input tokens, of which 7,959,552 were cached, and 158,516 output tokens. No Claude calls were made.

Reports: [sample 1](vibe-2026-11-02.md), [sample 2](vibe-2026-11-03-s2.md), [sample 3](vibe-2026-11-03-s3.md).

---

# CRM 视觉基准：三样本综合结论

三次独立 Codex 运行使用完全相同的 brief、Mobbin 参考、截图矩阵和匿名视觉评分标准。每次生成三种实现，并覆盖五个状态和四个视口。

## 结果

| Arm | 三次分数 | 均值 | 中位数 | 极差 |
| --- | --- | ---: | ---: | ---: |
| plain | 94, 95, 92 | 93.7 | 94 | 3 |
| ds-core | 79, 64, 78 | 73.7 | 78 | 15 |
| ds-guided | 85, 61, 84 | 76.7 | 84 | 24 |

稳定结论是：plain 在三次样本中都更接近参考图。Atom63 提升了实现纪律，但没有让视觉结果更强或更稳定。两个 DS arm 的桌面端都有竞争力，主要失分来自响应式构图以及 selected/complete 状态。样本 2 中，两种 DS 实现都在 tablet 和 phone 把联系人详情直接压到表格内容上；样本 1 和 3 对相同状态的处理明显更好，这解释了大部分波动。

指导提高了典型视觉结果：ds-guided 中位数为 84，ds-core 为 78。但 guided 同时拥有最大极差和最差单次结果，因此还不能证明指导能稳定提升视觉输出。三个样本足以否定“现有指导会持续改善视觉结果”的说法，但不足以精确估计长期效果。

## 设计系统目前强在哪里

| 指标 | plain | ds-core | ds-guided |
| --- | --- | --- | --- |
| 三次 craft violations | 125, 124, 133 | 39, 76, 4 | 0, 49, 6 |
| 三次 literal colors | 123, 113, 133 | 38, 33, 0 | 0, 10, 0 |
| 系统组件占比 | 0%, 0%, 0% | 61%, 56%, 80% | 45%, 33%, 41% |

Atom63 能稳定推动实现使用 token 和系统组件。样本 3 表明，两种 DS arm 都能在保持桌面视觉完整的同时做到零 literal color。这是真实的杠杆，但它保障的是实现纪律，而不是视觉还原度。

可访问性暂时还不是生成结果的强项。每个 arm 的每个样本都有 serious axe 问题。guided 在样本 2 达到 237 个 nodes，包含 critical ARIA 结构错误和 nested interactive。提供可访问的 primitive，并不能防止组合方式无效。

## 决策

不要因为这次基准继续增加通用组件或 token。下一步应针对密集 list/detail 产品做一个窄而完整的响应式构图切片：

1. 增加经过审查的 table-to-mobile-list pattern，并明确列优先级。
2. 定义 tablet 侧板与 phone 详情 overlay，包括完整文档覆盖、滚动约束、inset、层级和关闭行为。
3. 为 desktop、tablet、phone 补齐 selected、empty、importing、complete 示例。
4. 增加避免 nested interactive row 和无效 ARIA table 组合的指导与检查。
5. 完成后重跑本基准，并使用不同 judge model 或人工盲评，降低同模型家族偏好风险。

这些证据只覆盖一个 CRM 参考和一个 Codex 模型家族，测试的是视觉还原强度，不代表整个设计系统或一般产品创意能力。三次样本合计使用 8,702,061 input tokens，其中 7,959,552 为 cached input，另有 158,516 output tokens；没有 Claude 调用。

报告：[样本 1](vibe-2026-11-02.md)、[样本 2](vibe-2026-11-03-s2.md)、[样本 3](vibe-2026-11-03-s3.md)。
