REPORTER = spec
BIN = ./node_modules/.bin
UNIT_TESTS = $(shell find test -name '*.test.js')
INSTRUMENTATION_OUTPUT = build/lib-cov
REPORTS = reports

test:
	@npm install
	@NODE_ENV= ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--recursive \
	--ui bdd \
	tests

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	--growl \
	--watch \
	tests

instrument: clean-coverage
    $(BIN)/istanbul instrument --output $(INSTRUMENTATION_OUTPUT) --no-compact \
        --variable global.__coverage__ lib

# run tests with instrumented code
coverage: instrument
    @ISTANBUL_REPORTERS=html,text-summary,cobertura EXPRESS_COV=1 \
        $(BIN)/mocha --bail --reporter mocha-istanbul $(UNIT_TESTS)
    $(MAKE) move-reports

move-reports:
    -mkdir -p reports
    -mv cobertura-coverage.xml reports
    -cp -r html-report reports/
    -rm -rf html-report

clean-coverage:
    -rm -rf $(INSTRUMENTATION_OUTPUT)
    -rm -rf $(REPORTS)

lint-report:
    $(BIN)/jshint --config $(JSHINT_CONFIG) \
        --jslint-reporter \
        $(SRC_FILES) \
        > reports/jslint.xml || true

style-report:
    $(BIN)/jshint --config $(JSHINT_CONFIG) \
        --checkstyle-reporter \
        $(SRC_FILES) \
        > reports/checkstyle-jshint.xml || true

.PHONY: test test-w
