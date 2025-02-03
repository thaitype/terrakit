.PHONY: examples

examples:
	cd examples/$(word 2,$(MAKECMDGOALS)) && bun install && bun run $(word 3,$(MAKECMDGOALS))

clean-all:
	scripts/clean-examples.sh

# Prevent errors when arguments are treated as targets
%:
	@: