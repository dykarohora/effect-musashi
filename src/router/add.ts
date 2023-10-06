import type { Handler, Method } from '../types'
import type { Node, Router } from './types'
import type { NonEmptyArray } from 'effect/ReadonlyArray'
import { isNonEmptyArray } from 'effect/ReadonlyArray'

const splitPath = (path: string): NonEmptyArray<string> => {
	const segments = path.split('/')
	if (segments[0] === '' && segments.length > 1) {
		segments.shift()
	}

	if (!isNonEmptyArray(segments)) {
		throw new Error('Path must be a non-empty string.')
	}

	return segments
}

const createNode = (): Node => ({ handlers: {}, children: {} })

const insert = (node: Node, segments: string[], method: Method, handler: Handler): Node => {
	if (!isNonEmptyArray(segments)) {
		return {
			...node,
			handlers: {
				...node.handlers,
				[method]: handler
			}
		}
	}

	const [head, ...tail] = segments
	const nextNode = node.children[head] ?? createNode()

	const updatedChildren = {
		...node.children,
		[head]: insert(nextNode, tail, method, handler)
	}

	return { ...node, children: updatedChildren }
}

type AddPayload = {
	method: Method
	path: string
	handler: Handler
}

type AddFunc = (payload: AddPayload) => (router: Router) => Router

export const add: AddFunc =
	({ method, path, handler }) =>
		(router) => {
			const segments = splitPath(path)
			const [head, ...tail] = segments

			if (head === '' && tail.length === 0) {
				return {
					...router,
					handlers: {
						...router.handlers,
						[method]: handler
					}
				}
			}

			const { handlers, children } = insert(router, segments, method, handler)

			return {
				basePath: router.basePath,
				handlers,
				children,
			}
		}

