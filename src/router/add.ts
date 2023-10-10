import type { Method } from '../types'
import type { Node, Router } from './types'
import { isNonEmptyArray } from 'effect/ReadonlyArray'
import { splitPath } from './splitPath'
import { type Schema } from '@effect/schema/Schema'

const createNode = (): Node => ({ handlers: {}, children: {} })

const insert = <O, I>(payload: {
	node: Node,
	segments: string[],
	method: Method,
	schema: {
		output: Schema<O> | 'stream',
		input?: Schema<I>
	},
	handler: (input?: I) => O | ReadableStream
}): Node => {
	const { schema, handler, method, segments, node } = payload
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

type AddPayloadBase = {
	method: Method,
	path: string
}
type Return = (router: Router) => Router

export function add<I>(payload: {
	schema: {
		output: 'stream',
		input: Schema<I>
	},
	handler: (input: I) => ReadableStream
} & AddPayloadBase): Return
export function add(payload: {
	schema: {
		output: 'stream'
	},
	handler: () => ReadableStream
} & AddPayloadBase): Return
export function add<O, I>(payload: {
	schema: {
		output: Schema<O>,
		input: Schema<I>
	},
	handler: (input: I) => O
} & AddPayloadBase): Return
export function add<O>(payload: {
	schema: {
		output: Schema<O>
	},
	handler: () => O
} & AddPayloadBase): Return
export function add<O, I>(payload: {
	schema: {
		output: Schema<O> | 'stream',
		input?: Schema<I>
	},
	handler: (input?: I) => O | ReadableStream
} & AddPayloadBase): Return {
	const { method, path, schema, handler } = payload

	return (router) => {
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
}

