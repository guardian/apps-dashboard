TARGETS=devices.js osVersion.js versionSpread.js versionSpreadMonth.js revenueThisMonth.js revenue6Months.js crashRateWeek.js reviewsForCurrentVersion.js appsFeedback.js suspiciousTermination.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
