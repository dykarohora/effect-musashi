import type {
	Api,
	JsonInputSchema,
	JsonOutputHandler,
	JsonOutputSchema,
	JsonOutputWithInputHandler,
	StreamOutputHandler,
	StreamOutputSchema,
	StreamOutputWithInputHandler,
	RequestHandler,
} from './types'
import { requestHandlerId } from './types'

type MakeFunc =
	<S extends Api<any, any, any, any>>(payload: {
			schema: S,
			handler: S extends { output: JsonOutputSchema<infer O>, input: JsonInputSchema<infer B, infer Q, infer P> }
				? JsonOutputWithInputHandler<B, Q, P, O>
				: S extends { output: JsonOutputSchema<infer O> }
					? JsonOutputHandler<O>
					: S extends { output: StreamOutputSchema, input: JsonInputSchema<infer B, infer Q, infer P> }
						? StreamOutputWithInputHandler<B, Q, P>
						: S extends { output: StreamOutputSchema }
							? StreamOutputHandler
							: never
		}
	) => RequestHandler

export const make: MakeFunc =
	({ schema, handler }) => ({
		[requestHandlerId]: requestHandlerId,
		schema,
		handler,
	})
