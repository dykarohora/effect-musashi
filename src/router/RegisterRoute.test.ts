import { pipe } from 'effect'
import { createRouter } from './createRouter'
import { RegisterRoute } from './RegisterRoute'
import { Schema as S } from '@effect/schema'

describe('RegisterRoute', () => {
	const schema = {
		input: S.struct({ id: S.string }),
		output: S.struct({ name: S.string, age: S.number })
	}

	const handler = (input: {
		readonly id: string
	}) => ({ name: input.id, age: 42 })
	it('Get handler can be registered for the base path.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get({ path: '/', schema, handler })
		)

		expect(router.handlers.get).toBeDefined()
	})

	it('Handlers can be registered for each HTTP method for a single path.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get({ path: '/posts', schema, handler }),
			RegisterRoute.post({ path: '/posts', schema, handler })
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.handlers.post).toBeDefined()
	})

	it('The path is divided into segments with the slash as the delimiter, and each segment is a node in the tri-tree.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get({ path: '/posts', schema, handler }),
			RegisterRoute.get({ path: '/posts/summary', schema, handler }),
			RegisterRoute.post({ path: '/posts/category', schema, handler }),
			RegisterRoute.get({
				path: '/hoge',
				schema: {
					input: S.struct({ age: S.number }),
					output: S.struct({ name: S.string })
				},
				handler: () => ({ name: 'hoge' })
			})
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.summary?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.category?.handlers.post).toBeDefined()
	})
})


