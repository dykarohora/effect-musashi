import type { Handler, Method } from '../types'
import { add } from './add'
import type { Router } from './types'
import { methods } from '../types'

type RegisterFunc = (path: string, handler: Handler) => (router: Router) => Router

type RegisterRouteType = {
	[key in Method]: RegisterFunc
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RegisterRoute: RegisterRouteType = ((): RegisterRouteType => {
	const entries = methods.map(
		(method) => [
			method,
			(path: string, handler: Handler) => add({ method, path, handler })
		] as const
	)

	return Object.fromEntries<RegisterFunc>(entries) as RegisterRouteType
})()
