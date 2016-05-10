TARGETS=membershipThankYou.js membership30days.js membershipAllTime.js membershipParagraph.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
