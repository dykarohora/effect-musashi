import { unstable_dev } from 'wrangler'
import app from './index'

it('test', async () => {
	const worker = await unstable_dev('./src/index.ts', {
		experimental: { disableExperimentalWarning: true }
	})

	try {
		const r = await worker.fetch()
		console.log(await r.text())
	} catch (error) {
		console.log(error)
	}
})
