import type { Request, Response } from 'express'

import prisma from '../db/dbconnect'
import type { User } from '../../generated/prisma'
interface CreateUrlRequest extends Request {
  body: {
    url: string
    intervalSec: number
  }
}


export const createUrl = async (req: CreateUrlRequest, res: Response) => {
  const { url, intervalSec } = req.body
  const user = req.user as User
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const newUrl = await prisma.uRL.create({
    data: {
      url: url,
      intervalSec: intervalSec,
      userId: user.id,
    },
  })
    res.status(201).json(newUrl)
}


export const getUrls = async (req: Request, res: Response) => {
  const user = req.user as User
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const urls = await prisma.uRL.findMany({
    where: {
      userId: user.id,
    },
  })
  res.status(200).json(urls)
}

export const deleteUrl = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user as User
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const url = await prisma.uRL.delete({
    where: {
      id: id,
    },
  })
  res.status(200).json(url)
}

export const updateUrl = async (req: Request, res: Response) => {
  const { id } = req.params
  const { url, intervalSec } = req.body
  const user = req.user as User
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const updatedUrl = await prisma.uRL.update({
    where: {
      id: id,
    },
    data: {
      url: url,
      intervalSec: intervalSec,
    },
  })
  res.status(200).json(updatedUrl)
} 