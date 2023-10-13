export const methods = ['get', 'post', 'put', 'delete', 'head', 'options', 'patch'] as const

export type Method = typeof methods[number]

export type MusashiResponse<T> = {
	status: number
	headers?: Record<string, unknown>
	body: T
}
