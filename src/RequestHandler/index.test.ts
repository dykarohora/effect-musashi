import { handler, make, schema } from './index'
import { Schema as S } from '@effect/schema'
import { Effect } from 'effect'

describe('make', () => {
	it('test', () => {

		const s =
			schema({
				method: 'get',
				path: '/profile/:params',
				output: {
					_tag: 'json',
					body: S.struct({ name: S.string, age: S.number })
				},
				input: {
					_tag: 'json',
					body: S.struct({ id: S.string }),
					query: S.struct({ query: S.string }),
					params: S.struct({ params: S.string })
				}
			})

		type A = typeof s

		const requestHandler1 = make(
			schema({
				method: 'get',
				path: '/profile/:params',
				output: {
					_tag: 'json',
					body: S.struct({ name: S.string, age: S.number })
				},
				input: {
					_tag: 'json',
					body: S.struct({ id: S.string }),
					query: S.struct({ query: S.string }),
					params: S.struct({ params: S.string })
				}
			}),
			handler(({ body }) => Effect.succeed({ status: 200, body: { name: body.id, age: 45 } }))
		)

		const requestHandler2 = make(
			schema({
				method: 'get',
				path: '/profile/:params',
				output: {
					_tag: 'json',
					body: S.struct({ name: S.string, age: S.number })
				}
			}),
			handler(() => Effect.succeed({ status: 200, body: { name: 'hoge', age: 45 } }))
		)

		const requestHandler3 = make(
			schema({
				method: 'get',
				path: '/profile/:params',
				output: {
					_tag: 'stream',
				}
			}),
			handler(() => Effect.succeed({ status: 200, body: new ReadableStream() }))
		)

		const requestHandler4 = make(
			schema({
				method: 'get',
				path: '/profile/:params',
				output: {
					_tag: 'stream',
				},
				input: {
					_tag: 'json',
					body: S.struct({ id: S.string }),
					params: S.struct({ params: S.string })
				}
			}),
			handler(({ body, params }) => Effect.succeed({ status: 200, body: new ReadableStream() }))
		)
	})
})
