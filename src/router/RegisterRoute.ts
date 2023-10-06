import type { Method } from '../types'
import { add } from './add'
import type { HandlerWithSchema, Router } from './types'
import { methods } from '../types'

type RegisterFunc =
	<O, I = never>(payload: { path: string } & HandlerWithSchema<O, I>) =>
		(router: Router) => Router

type RegisterRouteType = {
	[key in Method]: RegisterFunc
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RegisterRoute = ((): RegisterRouteType => {
	const registerRoute = <O, I = never>(method: Method) =>
		({ path, schema, handler }: { path: string } & HandlerWithSchema<O, I>) =>
			add({ method, path, schema, handler })

	return methods.reduce(
		(acc, method) => ({ ...acc, [method]: registerRoute(method) }),
		{} as RegisterRouteType
	)
})()
