import type { RequestHandler } from '../RequestHandler'
import type { Router, Node } from './types'
import { splitPath } from './splitPath'
import { isNonEmptyArray } from 'effect/ReadonlyArray'

const createNode = (): Node => ({ requestHandlers: {}, children: {} })

type InsertPayload = {
	node: Node,
	segments: string[]
	requestHandler: RequestHandler
}

const insert =
	({ node, segments, requestHandler }: InsertPayload): Node => {
		if (!isNonEmptyArray(segments)) {
			return {
				...node,
				requestHandlers: {
					...node.requestHandlers,
					[requestHandler.schema.method]: requestHandler
				}
			}
		}

		const [head, ...tail] = segments
		const nextNode = node.children[head] ?? createNode()

		const updatedChildren = {
			...node.children,
			[head]: insert({ node: nextNode, segments: tail, requestHandler })
		}

		return { ...node, children: updatedChildren }
	}

export const add =
	(requestHandler: RequestHandler) =>
		(router: Router): Router => {
			const segments = splitPath(requestHandler.schema.path)
			const [head, ...tail] = segments

			if (head === '' && tail.length === 0) {
				return {
					...router,
					requestHandlers: {
						...router.requestHandlers,
						[requestHandler.schema.method]: requestHandler
					}
				}
			}

			const node = insert({ node: router, segments, requestHandler })

			return {
				basePath: router.basePath,
				...node
			}
		}
