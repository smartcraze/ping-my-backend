import { Router } from 'express'
import { getPingLogs, getLatestPingStatus, runPing } from '../Controllers/ping-logs'

const pingLogsRouter = Router()

pingLogsRouter.get('/:id/ping-logs', getPingLogs)
pingLogsRouter.get('/:id/status', getLatestPingStatus)
pingLogsRouter.post('/run', runPing)

export default pingLogsRouter;
