import { pipe } from 'effect'
import { Schema as S } from '@effect/schema'
import { add } from './add'
import { createRouter } from './createRouter'

describe('add', () => {
	const schema = {
		input: S.struct({ id: S.string }),
		output: S.struct({ name: S.string, age: S.number })
	}

	const handler = (input: { readonly id: string }) => ({ name: input.id, age: 42 })

	it('Get handler can be registered for the base path.', () => {
		const router = pipe(
			createRouter('/'),
			add({ method: 'get', path: '/', schema, handler })
		)

		expect(router.handlers.get?.handler).toBeDefined()
		expect(router.handlers.get?.schema).toBeDefined()
	})

	it('Handlers can be registered for each HTTP method for a single path.', () => {
		const router = pipe(
			createRouter('/'),
			add({ method: 'get', path: '/posts', schema, handler, }),
			add({ method: 'post', path: '/posts', schema, handler, })
		)

		expect(router.children.posts?.handlers.get?.handler).toBeDefined()
		expect(router.children.posts?.handlers.get?.schema).toBeDefined()
		expect(router.children.posts?.handlers.post?.schema).toBeDefined()
		expect(router.children.posts?.handlers.post?.schema).toBeDefined()
	})

	it('The path is divided into segments with the slash as the delimiter, and each segment is a node in the tri-tree.', () => {
		const router = pipe(
			createRouter('/'),
			add({ method: 'get', path: '/posts', handler, schema }),
			add({ method: 'get', path: '/posts/summary', handler, schema }),
			add({ method: 'post', path: '/posts/category', handler, schema, })
		)

		expect(router.children.posts?.handlers.get?.handler).toBeDefined()
		expect(router.children.posts?.handlers.get?.schema).toBeDefined()
		expect(router.children.posts?.children.summary?.handlers.get?.handler).toBeDefined()
		expect(router.children.posts?.children.summary?.handlers.get?.schema).toBeDefined()
		expect(router.children.posts?.children.category?.handlers.post?.handler).toBeDefined()
		expect(router.children.posts?.children.category?.handlers.post?.schema).toBeDefined()
	})

	it('Router is immutable.', () => {
		const router = createRouter('/')
		const updatedRouter = add({ method: 'get', path: '/', handler, schema })(router)

		expect(router).not.toBe(updatedRouter)
	})
})
