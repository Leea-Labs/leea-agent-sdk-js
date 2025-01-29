proto:
	rm -f "./src/protocol/*"
	npx protoc \
		--plugin="./node_modules/.bin/protoc-gen-ts" \
		--ts_out="./src/protocol" \
		--proto_path ./leea-agent-protocol \
		./leea-agent-protocol/*.proto
