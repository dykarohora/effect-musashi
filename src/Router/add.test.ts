import { Effect, pipe } from 'effect'
import { Schema as S } from '@effect/schema'
import { createRouter } from './createRouter'
import { add } from './add'
import { make } from '../RequestHandler'

describe('add', () => {
	it('Get handler can be registered for the base path.', () => {
		const router = pipe(
			createRouter('/'),
			add(
				make({
					schema: {
						method: 'get',
						path: '/posts',
						output: { type: 'stream' }
					},
					handler: () => Effect.succeed({ status: 200, body: new ReadableStream() })
				})
			),
			add(
				make({
					schema: {
						method: 'post',
						path: '/posts',
						output: { type: 'stream' },
						input: { body: S.struct({ id: S.string }) }
					},
					handler: () => Effect.succeed({ status: 200, body: new ReadableStream() })
				})
			),
			add(
				make({
					schema: {
						method: 'patch',
						path: '/posts',
						output: { body: S.struct({ name: S.string, age: S.number }) },
					},
					handler: () => Effect.succeed({ status: 200, body: { name: 'hoge', age: 42 } })
				})
			),
			add(
				make({
					schema: {
						method: 'put',
						path: '/posts',
						output: { body: S.struct({ name: S.string, age: S.number }) },
						input: { body: S.struct({ id: S.string }) }
					},
					handler: ({ body: { id } }) => Effect.succeed({ status: 200, body: { name: id, age: 42 } })
				})
			)
		)

		expect(router.children.posts?.requestHandlers.get?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.get?.schema).toBeDefined()
		expect(router.children.posts?.requestHandlers.post?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.post?.schema).toBeDefined()
		expect(router.children.posts?.requestHandlers.patch?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.patch?.schema).toBeDefined()
		expect(router.children.posts?.requestHandlers.put?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.put?.schema).toBeDefined()
	})

	it('Handlers can be registered for each HTTP method for a single path.', () => {
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
						method: 'post',
						path: '/posts',
						output: { body: S.struct({ name: S.string, age: S.number }) },
						input: { body: S.struct({ id: S.string }) }
					},
					handler: ({ body: { id } }) => Effect.succeed({ status: 200, body: { name: id, age: 42 } })
				})
			),
		)

		expect(router.children.posts?.requestHandlers.get?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.get?.schema).toBeDefined()
		expect(router.children.posts?.requestHandlers.post?.schema).toBeDefined()
		expect(router.children.posts?.requestHandlers.post?.schema).toBeDefined()
	})

	it('The path is divided into segments with the slash as the delimiter, and each segment is a node in the tri-tree.', () => {
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

		expect(router.children.posts?.requestHandlers.get?.handler).toBeDefined()
		expect(router.children.posts?.requestHandlers.get?.schema).toBeDefined()
		expect(router.children.posts?.children.summary?.requestHandlers.get?.handler).toBeDefined()
		expect(router.children.posts?.children.summary?.requestHandlers.get?.schema).toBeDefined()
		expect(router.children.posts?.children.category?.requestHandlers.post?.handler).toBeDefined()
		expect(router.children.posts?.children.category?.requestHandlers.post?.schema).toBeDefined()
	})

	it('Router is immutable.', () => {
		const router = createRouter('/')
		const updatedRouter =
			add(
				make({
					schema: {
						method: 'get',
						path: '/posts',
						output: { body: S.struct({ name: S.string, age: S.number }) },
					},
					handler: () => Effect.succeed({ status: 200, body: { name: 'hoge', age: 42 } })
				})
			)(router)

		expect(router).not.toBe(updatedRouter)
	})
})
