import type { Node, Router } from './types'
import type { Method } from '../types'
import type { RequestHandler } from '../RequestHandler'
import { splitPath } from './splitPath'
import { Either } from 'effect'
import { isNonEmptyArray } from 'effect/ReadonlyArray'
import { NotFoundHandlerError } from '../error'

type SearchPayload = {
	node: Node
	segments: string[]
	method: Method
}

const search =
	({ node, segments, method }: SearchPayload): Either.Either<NotFoundHandlerError, RequestHandler> => {
		if (!isNonEmptyArray(segments)) {
			const handlers = node.requestHandlers[method]

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
	(router: Router) =>
		({ method, path }: Payload) =>
			search({ node: router, segments: splitPath(path), method })
