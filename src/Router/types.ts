import type { RequestHandler } from '../RequestHandler'
import type { Method } from '../types'

export type Node = {
	requestHandlers: Partial<Record<Method, RequestHandler>>
	children: Record<string, Node>
}

export type Router =
	&{ basePath: string }
	& Node
