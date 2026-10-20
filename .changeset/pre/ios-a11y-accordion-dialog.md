---
'@atom63/ui-foundation': patch
---

Add `ios` sections to the accordion and modal dialog pattern contracts. The accordion checks its disabled header and that activation reveals and hides the content, since iOS does not report expanded state to XCUITest; the dialog checks that the sheet opens named by its title and closes back to the view that opened it.
