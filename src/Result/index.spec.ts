import { Result, Ok, Err, is_ok, is_err, _Ok, _Err } from '.'

describe('Result', () => {
  interface IScenario<T> {
    value: T
  }

  function getOkAssertion<T>(type: string) {
    return (scenario: IScenario<T>) => {
      it(
        "correctly creates an instance of Ok with value '" +
          scenario.value +
          "'",
        () => {
          const subject = Ok(scenario.value)

          expect(subject instanceof _Ok).toEqual(true)

          expect(subject.is_ok()).toEqual(true)
          expect(subject.is_err()).toEqual(false)

          expect(() => subject.unwrap_err()).toThrow()
          expect(subject.unwrap_or('' as any)).toEqual(scenario.value)

          if (is_ok(subject)) {
            expect(typeof subject.unwrap()).toEqual(type.toLowerCase())
            expect(subject.unwrap()).toEqual(scenario.value)
          } else {
            throw new Error('Has to be _Ok!')
          }
        },
      )
    }
  }

  function getErrAssertion<T>(type: string) {
    return (scenario: IScenario<T>) => {
      it(
        "correctly creates an instance of Err with value '" +
          scenario.value +
          "'",
        () => {
          const subject = Err(scenario.value)

          expect(subject instanceof _Err).toEqual(true)

          expect(subject.is_ok()).toEqual(false)
          expect(subject.is_err()).toEqual(true)

          expect(() => subject.unwrap()).toThrow()
          expect(subject.unwrap_or('optb' as any)).toEqual('optb')

          if (is_err(subject)) {
            expect(typeof subject.unwrap_err()).toEqual(type.toLowerCase())
            expect(subject.unwrap_err()).toEqual(scenario.value)
          } else {
            throw new Error('Has to be _Err!')
          }
        },
      )
    }
  }

  describe('Boolean', () => {
    const type = 'Boolean'

    const scenarios: IScenario<boolean>[] = [
      { value: true },
      { value: false },
      { value: Boolean(true) },
    ]

    const assertionOk = getOkAssertion<boolean>(type),
      assertionErr = getErrAssertion<boolean>(type)

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('Number', () => {
    const type = 'Number'

    const scenarios: IScenario<number>[] = [
      { value: 37 },
      { value: 3.14 },
      { value: 0 },
      { value: Math.LN2 },
      { value: Infinity },
      { value: NaN },
      { value: Number(1) },
    ]

    const assertionOk = getOkAssertion<number>(type),
      assertionErr = getErrAssertion<number>(type)

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('String', () => {
    const type = 'String'

    const scenarios: IScenario<string>[] = [
      { value: '' },
      { value: 'bla' },
      { value: typeof 1 },
      { value: String('abc') },
    ]

    const assertionOk = getOkAssertion<string>(type),
      assertionErr = getErrAssertion<string>(type)

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('Function', () => {
    const type = 'Function'

    const scenarios: IScenario<Function>[] = [
      {
        value: function() {},
      },
      {
        value: class C {},
      },
      { value: Math.sin },
    ]

    const assertionOk = getOkAssertion<Function>(type),
      assertionErr = getErrAssertion<Function>(type)

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('Object', () => {
    const type = 'Object'

    const scenarios: IScenario<Object>[] = [
      { value: { a: 1 } },
      { value: [1, 2, 4] },
      { value: new Date() },
      { value: new Boolean(true) },
      { value: new Number(1) },
      { value: new String('abc') },
    ]

    const assertionOk = getOkAssertion<Object>(type),
      assertionErr = getErrAssertion<Object>(type)

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('RegEx', () => {
    const val = /s/

    it("correctly creates an instance of Ok with value '" + val + "'", () => {
      const subject = Ok(val)

      expect(subject instanceof _Ok).toEqual(true)

      expect(subject.is_ok()).toEqual(true)
      expect(subject.is_err()).toEqual(false)

      if (is_ok(subject)) {
        const type = typeof subject.unwrap()

        expect(type === 'function' || type === 'object').toEqual(true)
        expect(subject.unwrap()).toEqual(val)
      } else {
        throw new Error('Has to be _Ok!')
      }
    })

    it("correctly creates an instance of Err with value '" + val + "'", () => {
      const subject = Err(val)

      expect(subject instanceof _Err).toEqual(true)

      expect(subject.is_ok()).toEqual(false)
      expect(subject.is_err()).toEqual(true)

      if (is_err(subject)) {
        const type = typeof subject.unwrap_err()

        expect(type === 'function' || type === 'object').toEqual(true)
        expect(subject.unwrap_err()).toEqual(val)
      } else {
        throw new Error('Has to be _Err!')
      }
    })
  })

  describe('Undefined, Null', () => {
    const array: string[] = ['a', 'b'],
      outOfBoundIndex = array.length + 1

    const object = { a: '_a', b: '_b' },
      outOfBoundProperty = 'z'

    const scenarios: IScenario<undefined | null>[] = [
      { value: undefined },
      { value: null },
      { value: array[outOfBoundIndex] },
      { value: [null][0] },
      { value: (object as any)[outOfBoundProperty] },
      { value: ({ _: null } as any)._ },
    ]

    const assertionOk = (scenario: IScenario<any>) => {
      it('Ok works correctly', () => {
        const subject = Ok(scenario.value)

        expect(subject instanceof _Ok).toEqual(true)

        expect(subject.is_ok()).toEqual(true)
        expect(subject.is_err()).toEqual(false)
        expect(subject.unwrap()).toEqual(scenario.value)
      })
    }

    const assertionErr = (scenario: IScenario<any>) => {
      it('Err works correctly', () => {
        const subject = Err(scenario.value)

        expect(subject instanceof _Err).toEqual(true)

        expect(subject.is_ok()).toEqual(false)
        expect(subject.is_err()).toEqual(true)
        expect(subject.unwrap_err()).toEqual(scenario.value)
      })
    }

    scenarios.forEach(assertionOk)
    scenarios.forEach(assertionErr)
  })

  describe('unwrap_or', () => {
    it('throws if no value provided', () => {
      let string: Result<string, string> = Ok(null as any)
      expect(() => string.unwrap_or(null as any)).toThrow()

      string = Err('string')
      expect(() => string.unwrap_or(null as any)).toThrow()
    })
  })

  describe('match', () => {
    it('correctly matches Ok and returns transformed value', () => {
      const string = Ok('string')

      const subject = string.match({
        ok: _ => _.toUpperCase(),
        err: _ => _,
      })

      expect(subject).toEqual('STRING')
    })

    it('correctly matches Err and returns fallback value', () => {
      const arr = [1, 2, 3]
      const number = Err(arr[0])

      const subject = number.match({
        ok: _ => 0,
        err: _ => _,
      })

      expect(subject).toEqual(1)
    })

    it('correctly matches Result and returns fallback value', () => {
      function getMessage(data: Result<string, string>) {
        return data.match({
          ok: _ => `Success: ${_}`,
          err: _ => `Error: ${_}`,
        })
      }

      expect(getMessage(Ok('ok'))).toEqual(`Success: ok`)
      expect(getMessage(Err('err'))).toEqual(`Error: err`)
    })
  })

  describe('map', () => {
    it('correctly maps Ok and returns transformed Result', () => {
      const string = Ok('123')

      const subject = string.map(_ => parseInt(_))

      expect(subject.unwrap()).toEqual(123)
    })

    it('correctly returns untouched Err when trying to use map', () => {
      const arr = [1, 2, 3]
      const number = Err(arr[0])

      const subject = number.map(_ => _.toString())

      expect(subject.unwrap_err()).toEqual(1)
    })

    it('correctly maps Result and returns transformed value', () => {
      function getMessage(
        data: Result<string, string>,
      ): Result<number, string> {
        return data.map(_ => parseInt(_))
      }

      let subject = getMessage(Ok('123'))
      expect(is_ok(subject) ? subject.unwrap() : 0).toEqual(123)

      subject = getMessage(Err('123'))
      expect(is_err(subject) ? subject.unwrap_err() : '0').toEqual('123')
    })
  })

  describe('ok', () => {
    it('correctly returns Some when Result is ok', () => {
      const string_ok = Ok('123')
      const subject = string_ok.ok()

      expect(subject.is_some()).toEqual(true)
      expect(subject.unwrap()).toEqual('123')
    })

    it('correctly returns None when Result is err', () => {
      const string_err = Err('123')
      const subject = string_err.ok()

      expect(subject.is_none()).toEqual(true)
    })
  })

  describe('err', () => {
    it('correctly returns Some when Result is err', () => {
      const string_err = Err('123')
      const subject = string_err.err()

      expect(subject.is_some()).toEqual(true)
      expect(subject.unwrap()).toEqual('123')
    })

    it('correctly returns None when Result is ok', () => {
      const string_ok = Ok('123')
      const subject = string_ok.err()

      expect(subject.is_none()).toEqual(true)
    })
  })
})
