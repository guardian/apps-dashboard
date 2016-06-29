TARGETS=osVersion.js devices.js crashRate.js latestVersionText.js membershipPurchases.js versionSpread.js versionSpreadMonth.js adoption.js membershipFlow.js appsFeedback.js crashSummary.js starRating.js subsRecoveryFlow.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
