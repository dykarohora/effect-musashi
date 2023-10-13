import { Schema as S } from '@effect/schema'
import { pipe, Either, Effect } from 'effect'
import { createRouter } from './createRouter'
import { add } from './add'
import { match } from './match'
import { NotFoundHandlerError } from '../error'

describe('match', () => {
	const schema = {
		input: S.struct({ id: S.string }),
		output: S.struct({ name: S.string, age: S.number })
	}

	const handler =
		(input: { readonly id: string }) =>
			Effect.succeed({
				status: 200,
				headers: { 'content-type': 'application/json' },
				body: { name: input.id, age: 42 }
			})

	const router = pipe(
		createRouter('/'),
		add({ method: 'get', path: '/posts', handler, schema }),
		add({ method: 'get', path: '/posts/summary', handler, schema }),
		add({ method: 'post', path: '/posts/category', handler, schema, })
	)

	const sut = match(router)

	it('If a handler associated with the specified method and path exists in the router, the handler and schema can be retrieved.', () => {
		const result1 = sut({ method: 'get', path: '/posts' })
		expect(Either.isRight(result1)).toBe(true)

		const result2 = sut({ method: 'get', path: '/posts/summary' })
		expect(Either.isRight(result2)).toBe(true)

		const result3 = sut({ method: 'post', path: '/posts/category' })
		expect(Either.isRight(result3)).toBe(true)
	})

	// 該当するハンドラが見つからない場合はundefinedを返す
	it('Returns an error if no corresponding handler is found.', () => {
		const result1 = sut({ method: 'get', path: '/articles' })
		if (Either.isRight(result1)) {
			throw new Error('test failed')
		}

		expect(result1.left).toBeInstanceOf(NotFoundHandlerError)

		const result2 = sut({ method: 'get', path: '/posts/details' })
		if (Either.isRight(result2)) {
			const a = result2.right.handler
			throw new Error('test failed')
		}

		expect(result2.left).toBeInstanceOf(NotFoundHandlerError)

		const result3 = sut({ method: 'post', path: '/posts' })
		if (Either.isRight(result3)) {
			throw new Error('test failed')
		}

		expect(result3.left).toBeInstanceOf(NotFoundHandlerError)
	})
})
