TARGETS=osVersion.js devices.js crashRate.js latestVersionText.js membershipPurchases.js versionSpread.js versionSpreadMonth.js adoption.js complaints.js membershipFlow.js appsFeedback.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
