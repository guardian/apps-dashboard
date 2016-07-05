TARGETS=osVersion.js devices.js crashRate.js latestVersionText.js membershipPurchases.js versionSpread.js versionSpreadMonth.js adoption.js membershipFlow.js appsFeedback.js crashSummary.js starRating.js subsRecoveryFlow.js crashScatter.js
REALTIME_TARGETS=todaysCrashRate.js todaysNumberOfComplaints.js


.PHONY: clean print-targets print-real-time-targets

all: $(TARGETS) $(REALTIME_TARGETS)

%.js: %-render.js
	node $<

real-time:
	-rm $(REALTIME_TARGETS)
	make $(REALTIME_TARGETS)

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
print-real-time-targets:
	$(info ${REALTIME_TARGETS})
