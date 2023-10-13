import type { Effect } from 'effect/Effect'
import type { Schema } from '@effect/schema/Schema'
import type { Method, MusashiResponse } from '../types'
import type { Node, Router } from './types'
import { splitPath } from './splitPath'
import { isNonEmptyArray } from 'effect/ReadonlyArray'
import { Either } from 'effect'
import { NotFoundHandlerError } from '../error'

type SearchPayload = {
	node: Node,
	segments: string[],
	method: Method,
}

type Return<O, I> =
	| {
	schema: { output: Schema<O>, input: Schema<I> },
	handler: (input: I) => Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
}
	| {
	schema: { output: Schema<O> },
	handler: () => Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
}
	| {
	schema: { output: 'stream', input: Schema<I> },
	handler: (input: I) => Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
}
	| {
	schema: { output: 'stream' },
	handler: () => Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
}

const search =
	<O, I>({ node, segments, method }: SearchPayload): Either.Either<NotFoundHandlerError, Return<O, I>> => {
		if (!isNonEmptyArray(segments)) {
			const handlers = node.handlers[method]

			return handlers === undefined
				? Either.left(new NotFoundHandlerError())
				: Either.right(handlers as Return<O, I>) // TODO as 使わないで実現できる？
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
		<O, I>({ method, path }: Payload): Either.Either<NotFoundHandlerError, Return<O, I>> =>
			search({ node, segments: splitPath(path), method })

