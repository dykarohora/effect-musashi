import type { Router } from './types'

export const createRouter =
	(basePath?: string): Router =>
		({ basePath: basePath ?? '/', handlers: {}, children: {} })
