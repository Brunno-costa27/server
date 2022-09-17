const express = require('express');
import { PrismaClient } from '@prisma/client'
import { converterHourStringToMinutes } from './utils/convert-hour-string-to-minute'

const app = express();
app.use(express.json())

const prisma = new PrismaClient({
    log: ['query']
})

app.get('/games', async (request: any, response: any) => {
    const games = await prisma.game.findMany({
        include: {
            _count: { 
                select: {
                    ads: true
                }
            }
        }
    })

    return response.json(games)
})

app.post('/games/:id/ads', async (request: any, response: any) => {
    const gameId = request.params.id;
    const body = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weebDays: body.weebDays.join(','),
            hourStart: converterHourStringToMinutes(body.hourStart),
            hourEnd: converterHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })
    return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request: any, response: any) => {

    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weebDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })



    return response.json(ads.map(ad => {
        return { 
            ...ad,
            weebDays: ad.weebDays.split(',')
        }
    }))
})

app.get('/ads/:id/discord',async (request: any, response: any) => {

    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return response.json({
        discord: ad.discord
    })
})


app.listen(3333)