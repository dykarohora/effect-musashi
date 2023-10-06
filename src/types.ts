export const methods = ['get', 'post', 'put', 'delete', 'head', 'options', 'patch'] as const

export type Method = typeof methods[number]
