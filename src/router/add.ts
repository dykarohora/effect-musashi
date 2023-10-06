import type { Handler, Method } from '../types'
import type { Router } from './types'
import type { NonEmptyArray } from 'effect/ReadonlyArray'
import { isNonEmptyArray } from 'effect/ReadonlyArray'

type AddPayload = {
	method: Method
	path: string
	handler: Handler
}

type AddFunc = (payload: AddPayload) => (router: Router) => Router

const splitPath = (path: string): NonEmptyArray<string> => {
	const segments = path.split('/')
	if (segments[0] === '' && segments.length > 1) {
		segments.shift()
	}

	if (!isNonEmptyArray(segments)) {
		throw new Error('Path must be a non-empty string.')
	}

	return segments
}

export const add: AddFunc =
	({ method, path, handler }) =>
		(router) => {
			const { handlers, children } = router

			const [head, ...tail] = splitPath(path)

			if (head === '' && tail.length === 0) {

				return {
					...router,
					handlers: {
						...router.handlers,
						[method]: handler
					}
				}
			}

			// headに対応するNodeがある

			// headに対応するNodeがない

			throw new Error('Not implemented.')
		}

