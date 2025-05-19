import type { Request, Response } from 'express';
import prisma from '../db/dbconnect';
import axios from 'axios'; 

export const getPingLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pingLogs = await prisma.pingLog.findMany({
      where: { urlId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(pingLogs);
  } catch (error) {
    console.error('Error fetching ping logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLatestPingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const latest = await prisma.pingLog.findFirst({
      where: { urlId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      res.status(404).json({ message: 'No ping logs found' });
      return;
    }

    res.status(200).json(latest);
  } catch (error) {
    console.error('Error fetching latest ping status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const runPing = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: 'URL ID is required' });
    return;
  }

  try {
    const urlEntry = await prisma.uRL.findUnique({ where: { id } });

    if (!urlEntry) {
        res.status(404).json({ message: 'URL not found' });
        return;
    }

    const startTime = Date.now();
    let status = 'success';
    let code: number | null = null;
    let latencyMs: number | null = null;

    try {
      const response = await axios.get(urlEntry.url, { timeout: 5000 });
      code = response.status;
    } catch (err: any) {
      status = 'fail';
      code = err?.response?.status || null;
    }

    latencyMs = Date.now() - startTime;

    const pingLog = await prisma.pingLog.create({
      data: {
        urlId: id,
        status,
        code,
        latencyMs,
      },
    });

    res.status(201).json(pingLog);
  } catch (error) {
    console.error('Ping error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
