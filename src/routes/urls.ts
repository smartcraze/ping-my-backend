import { Router } from 'express'
import { createUrl, deleteUrl, getUrls, updateUrl } from '../Controllers/urls'
import { ensureAuth } from '../middleware/authenticated'

const urlsRouter = Router()

urlsRouter.post('/', ensureAuth, createUrl)
urlsRouter.get('/', ensureAuth, getUrls)
urlsRouter.delete('/:id', ensureAuth, deleteUrl)
urlsRouter.put('/:id', ensureAuth, updateUrl)

export default urlsRouter;
