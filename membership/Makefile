TARGETS=membershipThankYou.js

.PHONY: clean print-targets

all: $(TARGETS)

%.js: %-render.js
	node $<

clean:
	-rm $(TARGETS)

print-targets:
	$(info ${TARGETS})
	
