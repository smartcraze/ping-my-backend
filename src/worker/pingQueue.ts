import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import axios from 'axios'
import prisma from '../db/dbconnect'

const connection = new IORedis()

export const pingQueue = new Queue('pingQueue', { connection })

export const pingWorker = new Worker('pingQueue', async (job: Job) => {
  const { url, id } = job.data as { url: string; id: string }

  const start = Date.now()
  try {
    const response = await axios.get(url, { timeout: 5000 })
    const latency = Date.now() - start

    await prisma.pingLog.create({
      data: {
        urlId: id,
        status: 'success',
        code: response.status,
        latencyMs: latency,
      },
    })

    await prisma.uRL.update({
      where: { id },
      data: { lastPingAt: new Date() },
    })

    console.log(`✅ Pinged ${url} - ${response.status} - ${latency}ms`)
  } catch (error: any) {
    const latency = Date.now() - start

    await prisma.pingLog.create({
      data: {
        urlId: id,
        status: 'fail',
        code: error?.response?.status ?? null,
        latencyMs: latency,
      },
    })

    await prisma.uRL.update({
      where: { id },
      data: { lastPingAt: new Date() },
    })

    console.error(`❌ Failed to ping ${url} - ${latency}ms`)
  }
}, { connection })

pingWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`)
})

pingWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`)
})
