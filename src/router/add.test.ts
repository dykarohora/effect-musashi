import { pipe } from 'effect'
import { constVoid } from 'effect/Function'
import { add } from './add'
import { createRouter } from './createRouter'

describe('add', () => {
	it('Get handler can be registered for the base path.', () => {
		const router = pipe(
			createRouter('/'),
			add({
				method: 'get',
				path: '/',
				handler: constVoid
			})
		)

		expect(router.handlers.get).toBeDefined()
	})

	it('Handlers can be registered for each HTTP method for a single path.', () => {
		const router = pipe(
			createRouter('/'),
			add({
				method: 'get',
				path: '/posts',
				handler: constVoid
			}),
			add({
				method: 'post',
				path: '/posts',
				handler: constVoid
			})
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.handlers.post).toBeDefined()
	})

	it('The path is divided into segments with the slash as the delimiter, and each segment is a node in the tri-tree.', () => {
		const router = pipe(
			createRouter('/'),
			add({
				method: 'get',
				path: '/posts',
				handler: constVoid
			}),
			add({
				method: 'get',
				path: '/posts/summary',
				handler: constVoid
			}),
			add({
				method: 'post',
				path: '/posts/category',
				handler: constVoid,
			})
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.summary?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.category?.handlers.post).toBeDefined()
	})

	it('Router is immutable.', () => {
		const router = createRouter('/')
		const updatedRouter = add({
			method: 'get',
			path: '/',
			handler: constVoid
		})(router)

		expect(router).not.toBe(updatedRouter)
	})
})
