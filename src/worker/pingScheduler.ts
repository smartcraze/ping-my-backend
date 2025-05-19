import { pingQueue } from './pingQueue'
import prisma from '../db/dbconnect'

const CHECK_INTERVAL = 10_000

export async function schedulePings() {
  console.log('⏰ Starting ping scheduler...')
  setInterval(async () => {
    const urls = await prisma.uRL.findMany({ where: { isActive: true } })
    const now = Date.now()

    for (const url of urls) {
      const lastPing = url.lastPingAt?.getTime() ?? 0
      const nextPing = lastPing + url.intervalSec * 1000

      if (now >= nextPing) {
        await pingQueue.add('pingJob', { id: url.id, url: url.url })
      }
    }
  }, CHECK_INTERVAL)
}
