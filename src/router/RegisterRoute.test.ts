import { constVoid } from 'effect/Function'
import { pipe } from 'effect'
import { createRouter } from './createRouter'
import { RegisterRoute } from './RegisterRoute'

describe('RegisterRoute', () => {
	it('Get handler can be registered for the base path.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get('/', constVoid)
		)

		expect(router.handlers.get).toBeDefined()
	})

	it('Handlers can be registered for each HTTP method for a single path.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get('/posts', constVoid),
			RegisterRoute.post('/posts', constVoid)
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.handlers.post).toBeDefined()
	})

	it('The path is divided into segments with the slash as the delimiter, and each segment is a node in the tri-tree.', () => {
		const router = pipe(
			createRouter('/'),
			RegisterRoute.get('/posts', constVoid),
			RegisterRoute.get('/posts/summary', constVoid),
			RegisterRoute.post('/posts/category', constVoid)
		)

		expect(router.children.posts?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.summary?.handlers.get).toBeDefined()
		expect(router.children.posts?.children.category?.handlers.post).toBeDefined()
	})
})
