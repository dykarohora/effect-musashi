import type { Effect } from 'effect/Effect'
import type { Schema } from '@effect/schema/Schema'
import type { Method, MusashiResponse } from '../types'
import type { Node, Router } from './types'
import { isNonEmptyArray } from 'effect/ReadonlyArray'
import { splitPath } from './splitPath'

const createNode = (): Node => ({ handlers: {}, children: {} })

const insert = <O, I>(payload: {
	node: Node,
	segments: string[],
	method: Method,
	schema: {
		output: Schema<O> | 'stream',
		input?: Schema<I>
	},
	handler: (input?: I) =>
		| Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
		| Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
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
	handler: (input: I) =>
		Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
} & AddPayloadBase): Return
export function add(payload: {
	schema: {
		output: 'stream'
	},
	handler: () =>
		Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
} & AddPayloadBase): Return
export function add<O, I>(payload: {
	schema: {
		output: Schema<O>,
		input: Schema<I>
	},
	handler: (input: I) =>
		Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
} & AddPayloadBase): Return
export function add<O>(payload: {
	schema: {
		output: Schema<O>
	},
	handler: () =>
		Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
} & AddPayloadBase): Return
export function add<O, I>(payload: {
	schema: {
		output: Schema<O> | 'stream',
		input?: Schema<I>
	},
	handler: (input?: I) =>
		| Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
		| Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
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

