import type { Schema } from '@effect/schema/Schema'
import type { Method } from '../types'

export type HandlerSchema<O, I = undefined> =
	O extends 'stream'
		? I extends undefined
			? {
				output: O
			}
			: {
				input: Schema<I>,
				output: O
			}
		: I extends undefined
			? {
				output: Schema<O>
			}
			: {
				input: Schema<I>,
				output: Schema<O>
			}

export type Handler<O, I = undefined> =
	O extends 'stream'
		? I extends undefined
			? () => ReadableStream
			: (input: I) => ReadableStream
		: I extends undefined
			? () => O
			: (input: I) => O

export type HandlerWithSchema<O = 'stream', I = undefined> = {
	schema: HandlerSchema<O, I>
	handler: Handler<O, I>
}

export type Node = {
	handlers: Partial<Record<Method, HandlerWithSchema>>
	children: Record<string, Node>
}

export type Router =
	&{ basePath: string }
	& Node

