import { make } from './make'
import { Schema as S } from '@effect/schema'
import { Effect } from 'effect'

describe('make', () => {
	it('test', () => {
		const requestHandler1 = make({
			schema: {
				method: 'get',
				path: '/profile/:params',
				output: { body: S.struct({ name: S.string, age: S.number }) },
				input: {
					body: S.struct({ id: S.string }),
					query: S.struct({ query: S.string }),
					params: S.struct({ params: S.string })
				}
			},
			handler: ({ body, params, query }) => Effect.succeed({ status: 200, body: { name: 'hoge', age: 45 } })
		})

		const requestHandler2 = make({
			schema: {
				method: 'get',
				path: '/profile/:params',
				output: { body: S.struct({ name: S.string, age: S.number }) }
			},
			handler: () => Effect.succeed({ status: 200, body: { name: 'hoge', age: 45 } })
		})

		const requestHandler3 = make({
			schema: {
				method: 'get',
				path: '/profile/:params',
				output: { type: 'stream' }
			},
			handler: () => Effect.succeed({ status: 200, body: new ReadableStream() })
		})

		const requestHandler4 = make({
			schema: ({
				method: 'get',
				path: '/profile/:params',
				output: { type: 'stream' },
				input: {
					body: S.struct({ id: S.string }),
					query: S.struct({ query: S.string }),
					params: S.struct({ params: S.string })
				}
			}),
			handler: (({ body, params }) => Effect.succeed({ status: 200, body: new ReadableStream() }))
		})
	})
})
