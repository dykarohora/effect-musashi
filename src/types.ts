export type Method =
	| 'get'
	| 'post'
	| 'put'
	| 'delete'
	| 'head'
	| 'options'
	| 'patch'

export type Handler = (context: unknown) => unknown
