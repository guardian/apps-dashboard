TARGETS=devices.js osVersion.js versionSpread.js versionSpreadMonth.js revenueThisMonth.js revenue6Months.js crashRateWeek.js reviewsForCurrentVersion.js appsFeedback.js suspiciousTermination.js devicesBeta.js screenSize.js osVersionBeta.js screenSizeBeta.js starRatingsGraph.js crashRatesGraph.js developmentTimeGraph.js appVersion.js membershipFlow.js 
REALTIME_TARGETS=todaysCrashRate.js todaysAdoptionRate.js realTimeTimestamp.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

real-time:
	-rm $(REALTIME_TARGETS)
	make $(REALTIME_TARGETS)

clean:
	-rm $(TARGETS)

print-real-time-targets:
	$(info ${REALTIME_TARGETS})

print-targets:
	$(info ${TARGETS})
	
