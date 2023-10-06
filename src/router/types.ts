import type { Schema } from '@effect/schema/Schema'
import type { Method } from '../types'

export type HandlerSchema<O, I = any> = {
	input?: Schema<I, I>
	output: Schema<O, O>
}

export type Handler<O, I = any> = (input: I) => O

export type HandlerWithSchema<O, I = never> = {
	schema: HandlerSchema<O, I>
	handler: Handler<O, I>
}

export type Node = {
	handlers: Partial<Record<Method, HandlerWithSchema<unknown, unknown>>>
	children: Record<string, Node>
}

export type Router =
	& { basePath: string }
	& Node
