import type { Handler, Method } from '../types'


export type Router =
	& { basePath: string }
	& Node

export type Node = {
	handlers: Partial<Record<Method, Handler>>
	children: Record<string, Node>
}
