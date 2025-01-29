.PHONY: examples

# examples:
# 	cd examples/$(name) && bun install && bun $(script)

examples:
	cd examples/$(word 2,$(MAKECMDGOALS)) && bun install && bun run $(word 3,$(MAKECMDGOALS))

# Prevent errors when arguments are treated as targets
%:
	@: