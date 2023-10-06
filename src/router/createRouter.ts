import type { Router } from './types'

export const createRouter =
	(basePath: string): Router =>
		({ basePath, handlers: {}, children: {} })
