import type { NonEmptyArray } from 'effect/ReadonlyArray'
import { isNonEmptyArray } from 'effect/ReadonlyArray'

export const splitPath = (path: string): NonEmptyArray<string> => {
	const segments = path.split('/')
	if (segments[0] === '' && segments.length > 1) {
		segments.shift()
	}

	if (!isNonEmptyArray(segments)) {
		throw new Error('Path must be a non-empty string.')
	}

	return segments
}
