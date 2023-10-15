import type { Router } from './router/types'
import type { Method } from './types'
import { match } from './router/match'
import { Either, pipe } from 'effect'

export const createApp = (router: Router) => {
	const app = {
		async fetch(req: Request, ...args: unknown[]) {
			// パスを取得
			const url = new URL(req.url)
			const path = url.pathname
			const method = req.method.toLowerCase() as Method

			const matchResult = match(router)({ method, path })

			if (Either.isLeft(matchResult)) {
				return new Response('Not Found', { status: 404 })
			}

			const { schema, handler } = matchResult.right

			if (schema.output === 'stream') {
				// TODO ストリーム処理
				throw new Error('Not Implemented')
			}


			if ('input' in matchResult.right.schema) {
				const inputValidator = matchResult.right.schema.input

				const body = await req.json()

				const result = (handler as (input: unknown) => unknown)(body)
				return new Response(JSON.stringify(result), { status: 200 })
			}

			const result = (handler as () => unknown)()
			return new Response(JSON.stringify(result), { status: 200 })


			// TODO クエリストリング
			// TODO パスパラメータ
		}
	}

	return app
}


