PORT ?= 8000

.PHONY: load-test seed-load-test clean-load-test
load-test:
	npx artillery run --target http://localhost:$(PORT) artillery.yml

seed-load-test:
	node scripts/seed-load-test-users.js

clean-load-test:
	node scripts/cleanup-load-test-users.js
