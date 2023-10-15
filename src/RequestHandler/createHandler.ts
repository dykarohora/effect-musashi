import { type Schema as S } from '@effect/schema/Schema'
import { Schema as SI } from '@effect/schema'
import { Effect, pipe } from 'effect'
import { type Method, type MusashiResponse } from '../types'


type JsonInputSchema<B, Q, P> = {
	_tag: 'json',
	body?: S<B>
	query?: S<Q>
	params?: S<P>
}

type BinaryInputSchema = {
	_tag: 'binary',
}

type InputSchema<B, Q, P> =
	| JsonInputSchema<B, Q, P>
	| BinaryInputSchema

type JsonOutputSchema<O> = {
	_tag: 'json',
	body: S<O>
}

type StreamOutputSchema = {
	_tag: 'stream',
}

type OutputSchema<O> =
	| JsonOutputSchema<O>
	| StreamOutputSchema

type Schema<O, B, Q, P> = {
	method: Method,
	path: string,
	output: OutputSchema<O>,
	input?: InputSchema<B, Q, P>,
}

type Handler1<B, Q, P> = (input: {
	body: B,
	query: Q,
	params: P
}) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
type Handler2 = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
type Handler3<B, Q, P, O> = (input: {
	body: B,
	query: Q,
	params: P
}) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
type Handler4<O> = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>

// TODO これの逆を作れるか？
type CreateHandler =
	<S extends Schema<any, any, any, any>>(schema: S) =>
		S extends { output: JsonOutputSchema<infer O>, input: JsonInputSchema<infer B, infer Q, infer P> }
			? (handler: Handler3<B, Q, P, O>) => string
			: S extends { output: JsonOutputSchema<infer O> }
				? (handler: Handler4<O>) => string
				: S extends { output: StreamOutputSchema, input: JsonInputSchema<infer B, infer Q, infer P> }
					? (handler: Handler1<B, Q, P>) => string
					: S extends { output: StreamOutputSchema }
						? (handler: Handler2) => string
						: never

type Make =
	<S extends Schema<any, any, any, any>>(
		schema: S,
		handler: S extends { output: JsonOutputSchema<infer O>, input: JsonInputSchema<infer B, infer Q, infer P> }
			? Handler3<B, Q, P, O>
			: S extends { output: JsonOutputSchema<infer O> }
				? Handler4<O>
				: S extends { output: StreamOutputSchema, input: JsonInputSchema<infer B, infer Q, infer P> }
					? Handler1<B, Q, P>
					: S extends { output: StreamOutputSchema }
						? Handler2
						: never
	) => string

declare const make: Make

const a = make(
	{
		method: 'get',
		path: '/profile/:params',
		output: {
			_tag: 'json',
			body: SI.struct({ name: SI.string, age: SI.number }),
			query: SI.struct({ query: SI.string })
		},
		input: {
			_tag: 'json',
			body: SI.struct({ name: SI.string, age: SI.number }),
		}
	},
	({
		body: { name, age },
	}) => Effect.succeed({ status: 200, body: { name: 'hoge', age: 45 } })
)


type CreateHandlerAlt = <H extends (i: any) => any>(handler: H) =>
	H extends Handler1<infer B, infer Q, infer P>
		? (schema: Schema<unknown, B, Q, P>) => string
		: never


declare const createHandler: CreateHandler

declare const createHandlerAlt: CreateHandlerAlt

createHandlerAlt(
	(payload: { body: { readonly name: string, readonly age: number } }) =>
		Effect.succeed({ status: 200, body: new ReadableStream() })
)({
	method: 'get',
	path: '/profile/:params',
	output: { _tag: 'stream' },
	input: {
		_tag: 'json',
		body: SI.struct({ name: SI.string, age: SI.number }),
	}
})

const output: JsonOutputSchema<{ name: string, age: number }> = {
	_tag: 'json',
	body: SI.struct({ name: SI.string, age: SI.number })
}

const f = createHandler({
	method: 'get',
	path: '/profile/:params',
	output: {
		_tag: 'json',
		body: SI.struct({ name: SI.string, age: SI.number })
	},
})
f(() => Effect.succeed({ status: 200, body: { name: 'hoge', age: 45 } }))

const g = createHandler({
	method: 'get',
	path: '/profile/:params',
	output: {
		_tag: 'stream',
	},
	input: {
		_tag: 'json',
		body: SI.struct({ name: SI.string, age: SI.number }),
		query: SI.struct({ query: SI.string })
	}
})

g(({ body, query }) => Effect.succeed({ status: 200, body: new ReadableStream() }))

const s = pipe(
	createHandler({
		method: 'get',
		path: '/profile/:params',
		output: {
			_tag: 'stream',
		},
		input: {
			_tag: 'json',
			body: SI.struct({ name: SI.string, age: SI.number }),
			query: SI.struct({ query: SI.string })
		}
	}),
	(f) => f(({ body, query }) => Effect.succeed({ status: 200, body: new ReadableStream() }))
)

// Type Handler1<I> = (input: I) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
// type Handler2 = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<ReadableStream>>
// type Handler3<I, O> = (input: I) => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
// type Handler4<O> = () => Effect.Effect<never, MusashiResponse<unknown>, MusashiResponse<O>>
//
//
//
//
// type HandlerSchema<O, I> =
// 	| { output: 'stream', input: Schema<I> }
// 	| { output: 'stream' }
// 	| { output: Schema<O>, input: Schema<I> }
// 	| { output: Schema<O> }
//
// type CreateHandler =
// 	<S extends HandlerSchema<any, any>>(schema: S) => S extends { output: 'stream', input: Schema<infer I> }
// 		? (path: string, handler: Handler1<I>) => void
// 		: S extends { output: 'stream' }
// 			? (path: string, handler: Handler2) => void
// 			: S extends { output: Schema<infer O>, input: Schema<infer I> }
// 				? (path: string, handler: Handler3<I, O>) => void
// 				: S extends { output: Schema<infer O> }
// 					? (path: string, handler: Handler4<O>) => void
// 					: never
//
