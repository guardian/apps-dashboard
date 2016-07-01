TARGETS=osVersion.js devices.js crashRate.js latestVersionText.js membershipPurchases.js versionSpread.js versionSpreadMonth.js adoption.js membershipFlow.js appsFeedback.js crashSummary.js starRating.js subsRecoveryFlow.js
REALTIME_TARGETS=todaysCrashRate.js todaysNumberOfComplaints.js


.PHONY: real-time clean print-targets

all: $(TARGETS) $(REALTIME_TARGETS)

%.js: %-render.js
	node $<

real-time:
	rm $(REALTIME_TARGETS)
	make $(REALTIME_TARGETS)

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
