/* global MockSocket, MockRunner, createQUnitStartFn, reporter:true */

// Tests for adapter/qunit.src.js
// These tests are executed in browser.

describe('adapter qunit', function () {
  var Karma = window.__karma__.constructor

  describe('reporter', function () {
    var runner
    var tc

    beforeEach(function () {
      tc = new Karma(new MockSocket(), null, null, null, {search: ''})
      runner = new MockRunner()
      reporter = new (createQUnitStartFn(tc, runner))()
    })

    describe('done', function () {
      it('should report complete', function () {
        spyOn(tc, 'complete')

        runner.emit('done')
        expect(tc.complete).toHaveBeenCalled()
      })
    })

    describe('total number of tests', function () {
      it('should use the tracking in qunit if available', function () {
        spyOn(tc, 'info').and.callFake(function (result) {
          expect(result.total).toBe(1)
        })

        var mockQUnitResult = {
          totalTests: 1
        }

        runner.emit('begin', mockQUnitResult)
        expect(tc.info).toHaveBeenCalled()
      })

      it('should use our own tracking if none is available', function () {
        spyOn(tc, 'info').and.callFake(function (result) {
          expect(result.total).toBe(1)
        })

        var mockQUnitResult = {
          name: 'should do something',
          module: 'desc1',
          failed: 0
        }

        runner.emit('testStart', mockQUnitResult)
        runner.emit('testDone', mockQUnitResult)
        runner.emit('done')

        expect(tc.info).toHaveBeenCalled()
      })

    })

    describe('test start', function () {
      it('should create a qunit-fixture element, and remove if exists', function () {
        runner.emit('testStart', {})

        var fixture = document.getElementById('qunit-fixture')
        expect(fixture).toBeDefined()

        fixture.className = 'marker'
        runner.emit('testStart', {})

        fixture = document.getElementById('qunit-fixture')
        expect(fixture).toBeDefined()
        expect(fixture.className).not.toBe('marker')
      })

    })

    describe('test end', function () {
      it('should report result', function () {
        spyOn(tc, 'result').and.callFake(function (result) {
          expect(result.description).toBe('should do something')
          expect(result.suite instanceof Array).toBe(true)
          expect(result.success).toBe(true)
          expect(result.log instanceof Array).toBe(true)
        })

        var mockQUnitResult = {
          name: 'should do something',
          module: 'desc1',
          failed: 0
        }

        runner.emit('testStart', mockQUnitResult)
        runner.emit('testDone', mockQUnitResult)

        expect(tc.result).toHaveBeenCalled()
      })

      it('should report failed result', function () {
        spyOn(tc, 'result').and.callFake(function (result) {
          expect(result.success).toBe(false)
          expect(result.log).toEqual(['Big trouble.\n'])
        })

        var mockQUnitResult = {
          module: 'desc1',
          failed: 1,
          name: 'should do something'
        }

        var mockQUnitLog = {
          result: false,
          message: 'Big trouble.'
        }

        runner.emit('testStart', mockQUnitResult)
        runner.emit('log', mockQUnitLog)
        runner.emit('testDone', mockQUnitResult)

        expect(tc.result).toHaveBeenCalled()
      })
    })
  })
})
