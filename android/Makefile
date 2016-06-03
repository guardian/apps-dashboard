TARGETS=osVersion.js devices.js crashRateWeek.js membershipPurchasesText.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
