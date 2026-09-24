---
'@atom63/styles': patch
---

`--font-family-mono` lists a Simplified Chinese face for each platform before the generic `monospace`: PingFang SC, Microsoft YaHei, Noto Sans Mono CJK SC and WenQuanYi Zen Hei Mono. Before, CJK text in monospace fell back to whichever CJK font the system picked, and on Linux that choice changed between runs.
