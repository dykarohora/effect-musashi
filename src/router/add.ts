import type { Method } from '../types'
import type { HandlerWithSchema, Node, Router } from './types'
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

type InsertPayload<O, I = never> =
	& {
		node: Node,
		segments: string[],
		method: Method,
	}
	& HandlerWithSchema<O, I>

const insert = <O, I = never>({ node, segments, method, schema, handler }: InsertPayload<O, I>): Node => {
	if (!isNonEmptyArray(segments)) {
		return {
			...node,
			handlers: {
				...node.handlers,
				[method]: { schema, handler }
			}
		}
	}

	const [head, ...tail] = segments
	const nextNode = node.children[head] ?? createNode()

	const updatedChildren = {
		...node.children,
		[head]: insert({ node: nextNode, segments: tail, method, schema, handler })
	}

	return { ...node, children: updatedChildren }
}

type AddPayload<O, I = never> =
	& {
		method: Method
		path: string
	}
	& HandlerWithSchema<O, I>

type AddFunc = <O, I = never>(payload: AddPayload<O, I>) => (router: Router) => Router

export const add: AddFunc =
	({ method, path, schema, handler }) =>
		(router) => {
			const segments = splitPath(path)
			const [head, ...tail] = segments

			if (head === '' && tail.length === 0) {
				return {
					...router,
					handlers: {
						...router.handlers,
						[method]: { schema, handler }
					}
				}
			}

			const { handlers, children } = insert({ node: router, segments, method, schema, handler })

			return {
				basePath: router.basePath,
				handlers,
				children,
			}
		}

