TARGETS=osVersion.js devices.js crashRate.js latestVersionText.js membershipPurchasesText.js membershipPurchasesChart.js versionSpread.js versionSpreadMonth.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
