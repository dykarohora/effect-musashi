import { Schema as S } from '@effect/schema'
import { pipe, Either, Effect } from 'effect'
import { NotFoundHandlerError } from '../error'
import { createRouter } from './createRouter'
import { add } from './add'
import { make } from '../RequestHandler'
import { match } from './match'

describe('match', () => {
	const router = pipe(
		createRouter('/'),
		add(
			make({
				schema: {
					method: 'get',
					path: '/posts',
					output: { body: S.struct({ name: S.string, age: S.number }) },
					input: { body: S.struct({ id: S.string }) }
				},
				handler: ({ body: { id } }) => Effect.succeed({ status: 200, body: { name: id, age: 42 } })
			})
		),
		add(
			make({
				schema: {
					method: 'get',
					path: '/posts/summary',
					output: { body: S.struct({ name: S.string, age: S.number }) },
					input: { body: S.struct({ id: S.string }) }
				},
				handler: ({ body: { id } }) => Effect.succeed({ status: 200, body: { name: id, age: 42 } })
			})
		),
		add(
			make({
				schema: {
					method: 'post',
					path: '/posts/category',
					output: { body: S.struct({ name: S.string, age: S.number }) },
					input: { body: S.struct({ id: S.string }) }
				},
				handler: ({ body: { id } }) => Effect.succeed({ status: 200, body: { name: id, age: 42 } })
			})
		),
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
