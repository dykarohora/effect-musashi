import type { Method } from '../types'
import type { HandlerWithSchema, Node, Router } from './types'
import { splitPath } from './splitPath'
import { isNonEmptyArray } from 'effect/ReadonlyArray'
import { Either } from 'effect'
import { NotFoundHandlerError } from '../error'

type SearchPayload = {
	node: Node,
	segments: string[],
	method: Method,
}

const search =
	({ node, segments, method }: SearchPayload): Either.Either<NotFoundHandlerError, HandlerWithSchema<unknown, unknown>> => {
		if (!isNonEmptyArray(segments)) {
			const handlers = node.handlers[method]

			return handlers === undefined
				? Either.left(new NotFoundHandlerError())
				: Either.right(handlers)
		}

		const [head, ...tail] = segments
		const nextNode = node.children[head]

		return nextNode === undefined
			? Either.left(new NotFoundHandlerError())
			: search({ node: nextNode, segments: tail, method })
	}

type Payload = {
	method: Method
	path: string
}

export const match =
	(node: Router) =>
		({ method, path }: Payload): Either.Either<NotFoundHandlerError, HandlerWithSchema<unknown, unknown>> =>
			search({ node, segments: splitPath(path), method })

