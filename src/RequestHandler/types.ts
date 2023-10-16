import type { Method, MusashiResponse } from '../types'
import type { Schema } from '@effect/schema/Schema'
import type { Effect } from 'effect'

export type JsonInputSchema<B, Q, P> = {
	body?: Schema<B>
	query?: Schema<Q>
	params?: Schema<P>
}

type BinaryInputSchema = {
	_tag: 'binary',
}

export type JsonOutputSchema<O> = {
	body: Schema<O>
}

export type StreamOutputSchema = {
	type: 'stream',
}

export type JsonOutputWithInputApi<O, B, Q, P> = {
	method: Method,
	path: string,
	output: JsonOutputSchema<O>,
	input: JsonInputSchema<B, Q, P>,
}

export type JsonOutputWithInputHandler<B, Q, P, O> = (input: {
	body: B,
	query: Q,
	params: P
}) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>

export type JsonOutputApi<O> = {
	method: Method,
	path: string,
	output: JsonOutputSchema<O>,
}

export type JsonOutputHandler<O> = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>

export type StreamOutputWithInputApi<B, Q, P> = {
	method: Method,
	path: string,
	output: StreamOutputSchema,
	input: JsonInputSchema<B, Q, P>,
}

export type StreamOutputWithInputHandler<B, Q, P> = (input: {
	body: B,
	query: Q,
	params: P
}) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>

export type StreamOutputApi = {
	method: Method,
	path: string,
	output: StreamOutputSchema,
}

export type StreamOutputHandler = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>

export type Api<O, B, Q, P> =
	| JsonOutputWithInputApi<O, B, Q, P>
	| JsonOutputApi<O>
	| StreamOutputWithInputApi<B, Q, P>
	| StreamOutputApi

export type Handler =
	| JsonOutputWithInputHandler<any, any, any, any>
	| JsonOutputHandler<any>
	| StreamOutputWithInputHandler<any, any, any>
	| StreamOutputHandler

export const requestHandlerId: unique symbol = Symbol.for('effect-musashi/RequestHandler/RequestHandlerId')
export type RequestHandlerId = typeof requestHandlerId

export type RequestHandler = {
	[requestHandlerId]: RequestHandlerId,
	schema: Api<any, any, any, any>,
	handler: Handler,
}
