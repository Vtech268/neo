import { Instance, Utils, Config } from '@neoxr/wb'
import { clone } from './mapping.js'
import nodemailer from 'nodemailer'

export default class TaskScheduler {
   constructor(client, options, database = null, verbose = false) {
      this.parent = clone.get('sync')
      this.client = client
      this.options = options
      this.verbose = verbose
      this.database = database
      this.recurringIntervalId = null
      this.dynamicTimers = new Map()
      this.emailServiceEnabled = false
      this._checkingPremium = false

      if (process.env.USER_NAME && process.env.USER_EMAIL && process.env.USER_APP_PASSWORD && process.env.USER_EMAIL_PROVIDER) {
         try {
            this.transport = nodemailer.createTransport({
               service: process.env.USER_EMAIL_PROVIDER,
               auth: {
                  user: process.env.USER_EMAIL,
                  pass: process.env.USER_APP_PASSWORD
               }
            })
            this.emailServiceEnabled = true
            if (this.verbose) console.log('[EMAIL NOTIFICATION] Service is configured and enabled.')
         } catch (e) {
            Utils.printError(`[EMAIL NOTIFICATION] Failed to create transport: ${e.message}`)
         }
      } else {
         if (this.verbose) console.log('[EMAIL NOTIFICATION] Service is disabled due to missing environment variables.')
      }
   }

   _getData() {
      const { hostJid, clientJid, findJid } = this.options
      return !hostJid && findJid.bot(clientJid) ? findJid.bot(clientJid).data : global.db
   }

   async notifyToEmail(email, message, data = {}) {
      if (!this.emailServiceEnabled) return

      try {
         const ownerName = data?.connector?.sessionOpts?.owner_name || 'Valued User'
         const mailOptions = {
            from: {
               name: process.env.USER_NAME,
               address: process.env.USER_EMAIL
            },
            to: email,
            subject: 'Subscription Notifications',
            html: `<div style="padding:20px;border:1px dashed #222;font-size:15px"><tt>Hi <b>${ownerName} 😘</b><br><br>${message.trim()}<br><br><hr style="border:0px; border-top:1px dashed #222"><br>Regards, <b>${Config.owner_name}</b></tt></div>`
         }
         const info = await this.transport.sendMail(mailOptions)
         if (this.verbose) console.log(`[EMAIL NOTIFICATION] Email sent to ${email}: ${info.response}`)
      } catch (e) {
         Utils.printError(`[EMAIL NOTIFICATION]: ${e}`)
      }
   }

   async _checkPremiumAndRent() {
      if (this._checkingPremium) return
      this._checkingPremium = true

      try {
         const data = this._getData()
         if (!data) return

         const now = Date.now()
         const day = 86400000

         try {
            const tz = process.env.TZ && process.env.TZ.trim() !== '' ? process.env.TZ : 'Asia/Jakarta'
            const nowTime = new Date().toLocaleTimeString('id-ID', {
               hour: '2-digit',
               minute: '2-digit',
               hour12: false,
               timeZone: tz
            }).replace(/\./g, ':')

            if (this._lastGroupCheckMinute !== nowTime) {
               this._lastGroupCheckMinute = nowTime

               const groups = data.groups || []
               for (const group of groups) {
                  if (!group) continue

                  const isOpenTime = group.open_at && group.open_at.time === nowTime
                  const isCloseTime = group.close_at && group.close_at.time === nowTime

                  if (isOpenTime || isCloseTime) {
                     try {
                        const meta = await this.client.groupMetadata(group.jid).catch(() => null)
                        if (!meta) continue

                        const botJid = this.client.decodeJid(this.client.user.id || this.client.user.lid)
                        const isBotAdmin = meta.participants.find(v =>
                           v.id === botJid || v.phoneNumber === botJid
                        )?.admin

                        if (!isBotAdmin) {
                           if (this.verbose) console.log(`[SCHEDULER] Skipping execution, bot is not an admin in group: ${group.jid}`)
                           continue
                        }

                        if (isOpenTime) {
                           if (meta.announce) {
                              await this.client.groupSettingUpdate(group.jid, 'not_announcement')
                              if (group.open_at.msg) {
                                 await this.client.reply(group.jid, group.open_at.msg)
                              }
                           }
                        }

                        if (isCloseTime) {
                           if (!meta.announce) {
                              await this.client.groupSettingUpdate(group.jid, 'announcement')
                              if (group.close_at.msg) {
                                 await this.client.reply(group.jid, group.close_at.msg)
                              }
                           }
                        }
                     } catch (e) {
                        if (this.verbose) console.error(`[SCHEDULER] Failed to process schedule for group ${group.jid}:`, e)
                     }
                  }
               }
            }
         } catch (e) {
            if (this.verbose) console.error('[SCHEDULER] Error during open/close scheduler:', e)
         }

         try {
            const premiumUsers = (data.users || []).filter(v => v.premium)

            for (const user of premiumUsers) {
               try {
                  const timeLeft = user.expired - now
                  const daysLeft = Math.ceil(timeLeft / day)

                  if (daysLeft > 0 && daysLeft <= 3) {
                     if (user.lastnotified !== daysLeft) {
                        if (data.setting.notifier) {
                           await this.client.reply(user.jid, Utils.texted('italic', `🚩 Your premium access will expire in ${daysLeft} day(s).`))
                           await Utils.delay(1000)
                        }
                        user.lastnotified = daysLeft
                     }
                  } else if (daysLeft <= 0) {
                     Object.assign(user, {
                        premium: false,
                        expired: 0,
                        limit: 0,
                        limit_game: 0,
                        lastnotified: 0
                     })

                     if (data.setting.notifier) {
                        await this.client.reply(user.jid, Utils.texted('italic', `🚩 Your premium package has expired.`))
                        await Utils.delay(1000)
                     }
                  }
               } catch (e) {
                  if (this.verbose) console.error(e)
               }
            }
         } catch (e) {
            if (this.verbose) console.error(e)
         }

         if (this.options.hostJid) {
            try {
               const premiumClient = (global.db.bots || []).filter(v => v.plan != 'none')

               for (const bot of premiumClient) {
                  try {
                     const timeLeft = bot.expired - now
                     const daysLeft = Math.ceil(timeLeft / day)

                     if (daysLeft > 0 && daysLeft <= 3) {
                        if (bot.connector?.override?.email) {
                           const lastSent = bot.last_email_remind || 0
                           if (now - lastSent >= day) {
                              await this.notifyToEmail(bot.connector.override.email, `Your bot hosting expire in ${daysLeft} day(s).`, bot)
                              bot.last_email_remind = now
                           }
                        }

                        if (bot.lastnotified !== daysLeft) {
                           if (data.setting.notifier && this.parent?.sock) {
                              await this.parent.sock.reply(bot.connector.sessionOpts.owner, Utils.texted('italic', `🚩 Your bot hosting expire in ${daysLeft} day(s).`))
                              await Utils.delay(1000)
                           }
                           bot.lastnotified = daysLeft
                        }
                     } else if (daysLeft <= 0) {
                        if (!bot.expired_email_sent) {
                           Object.assign(bot, {
                              expired: 0,
                              plan: 'none',
                              limit: 0,
                              stop: true,
                              expired_email_sent: true,
                              last_email_remind: 0
                           })

                           try {
                              const socket = await Instance.getSocketByJid(bot.jid)
                              if (socket) await socket.end()
                           } catch { }

                           if (bot.connector?.override?.email) {
                              await this.notifyToEmail(bot.connector.override.email, 'Your bot hosting has expired.', bot)
                           }

                           if (data.setting.notifier && this.parent?.sock) {
                              await this.parent.sock.reply(bot.connector.sessionOpts.owner, Utils.texted('italic', `🚩 Your bot hosting has expired.`))
                              await Utils.delay(1000)
                           }
                        }
                     }
                  } catch (e) {
                     if (this.verbose) console.error(e)
                  }
               }
            } catch (e) {
               if (this.verbose) console.error(e)
            }
         }

         try {
            const rentedGroups = (data.groups || []).filter(v => v.expired > 0)

            for (const group of rentedGroups) {
               try {
                  const timeLeft = group.expired - now
                  const daysLeft = Math.ceil(timeLeft / day)

                  if (daysLeft > 0 && daysLeft <= 3) {
                     if (group.lastnotified !== daysLeft) {
                        if (data.setting.notifier) {
                           try {
                              const participants = (await this.client.groupMetadata(group.jid).catch(() => null))?.participants || []
                              await this.client.reply(
                                 group.jid,
                                 Utils.texted('italic', `🚩 Bot's active period for this group will expire in ${daysLeft} day(s).`),
                                 null,
                                 { mentions: participants.map(p => p.id) }
                              )
                              await Utils.delay(1500)
                           } catch { }
                        }
                        group.lastnotified = daysLeft
                     }
                  } else if (daysLeft <= 0) {
                     if (data.setting.notifier) {
                        try {
                           const participants = (await this.client.groupMetadata(group.jid).catch(() => null))?.participants || []
                           await this.client.reply(
                              group.jid,
                              Utils.texted('italic', `🚩 Bot's active period for this group has expired.`),
                              null,
                              { mentions: participants.map(p => p.id) }
                           )
                           await Utils.delay(1000)
                        } catch { }
                     }

                     await this.client.groupLeave(group.jid).catch(() => { })
                     Utils.removeItem(data.groups, group)
                  }
               } catch (e) {
                  if (this.verbose) console.error(e)
               }
            }
         } catch (e) {
            if (this.verbose) console.error(e)
         }

         try {
            const menfessSessions = data.setting?.menfess || []
            const maxInactive = day

            for (let i = menfessSessions.length - 1; i >= 0; i--) {
               try {
                  const session = menfessSessions[i]
                  const inactiveTime = now - session.last_activity

                  if (inactiveTime >= maxInactive) {
                     const daysInactive = Math.floor(inactiveTime / day)
                     const msg = `⚠ Your menfess session has been removed due to ${daysInactive} day(s) of inactivity.`

                     if (data.setting.notifier) {
                        await this.client.reply(session.from, Utils.texted('italic', msg)).catch(() => { })
                        if (session.receiver) {
                           await this.client.reply(session.receiver, Utils.texted('italic', msg)).catch(() => { })
                        }
                     }

                     menfessSessions.splice(i, 1)
                     await Utils.delay(500)
                  }
               } catch (e) {
                  if (this.verbose) console.error(e)
               }
            }
         } catch (e) {
            if (this.verbose) console.error(e)
         }

      } catch (e) {
         if (this.verbose) console.error('TaskScheduler Error (_checkPremiumAndRent):', e)
      } finally {
         this._checkingPremium = false
      }
   }

   _formatDate(date) {
      const pad = num => String(num).padStart(2, '0')
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
   }

   _log(message) {
      if (this.verbose) console.log(`[${this._formatDate(new Date())}] ${message}`)
   }

   _parseTimeString(timeStr) {
      if (timeStr.includes('/')) {
         const [time, date] = timeStr.split(' ')
         const [hour, minute] = time.split(':').map(Number)
         const [day, month, year] = date.split('/').map(Number)
         return new Date(year, month - 1, day, hour, minute, 0)
      }
      const [hour, minute] = timeStr.split(':').map(Number)
      return { hour, minute }
   }

   async _sender(task) {
      try {
         const data = this._getData()
         const stillExists = data.setting.schedules.find(t => t.time === task.time && t.content === task.content)
         if (!stillExists && !task.recurring) return

         if (['pc', 'gc'].includes(task.type)) {
            task.mediaUrl
               ? await this.client.sendFile(task.jid, task.mediaUrl, '', task.content)
               : await this.client.reply(task.jid, task.content)
         } else {
            const groupMetadata = Object.values(await this.client.groupFetchAllParticipating())
            const targetGroups = groupMetadata
               .filter(g => !g.announce && !g.isCommunity && !(data.groups.find(v => v.jid === g.id)?.except))
               .map(g => g.id)

            for (const jid of targetGroups) {
               task.mediaUrl
                  ? await this.client.sendFile(jid, task.mediaUrl, '', task.content)
                  : await this.client.reply(jid, task.content)
               await Utils.delay(1500)
            }
         }
      } catch (e) {
         if (this.verbose) console.error(`Failed to send scheduled task: ${e.message}`)
      }
   }

   _scheduleDynamicTask(task, key) {
      const parsedTime = this._parseTimeString(task.time)

      if (parsedTime instanceof Date) {
         const now = new Date()
         const delay = parsedTime - now

         if (delay > 0) {
            if (this.verbose) this._log(`[One-Time Schedule] "${task.content}" at ${this._formatDate(parsedTime)}`)
            const timer = setTimeout(async () => {
               if (this.verbose) this._log(`[EXECUTING] Task "${task.content}"`)
               await this._sender(task)
               const data = this._getData()
               data.setting.schedules = data.setting.schedules.filter(t => t.time !== task.time && t.content !== task.content)
               this.dynamicTimers.delete(key)
            }, delay)
            this.dynamicTimers.set(key, timer)
         } else {
            const data = this._getData()
            data.setting.schedules = data.setting.schedules.filter(t => t.time !== task.time && t.content !== task.content)
         }
      } else {
         const { hour, minute } = parsedTime
         task.recurring = true

         const scheduleDaily = () => {
            const now = new Date()
            const nextExecution = new Date()
            nextExecution.setHours(hour, minute, 0, 0)
            if (nextExecution <= now) nextExecution.setDate(nextExecution.getDate() + 1)

            const delay = nextExecution - now
            const timer = setTimeout(async () => {
               if (this.verbose) this._log(`[DAILY EXECUTION] Task "${task.content}"`)
               await this._sender(task)
               scheduleDaily()
            }, delay)
            this.dynamicTimers.set(key, timer)
         }

         if (this.verbose) this._log(`[Daily Schedule] "${task.content}" at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
         scheduleDaily()
      }
   }

   _startDynamicTasks() {
      this._clearDynamicTimers()
      const tasks = this._getData().setting?.schedules || []
      tasks.forEach((task, index) => {
         this._scheduleDynamicTask(task, `${task.time}-${task.content}-${index}`)
      })
      if (this.verbose) this._log(`Dynamic scheduler started with ${tasks.length} task(s).`)
   }

   _clearDynamicTimers() {
      for (const timer of this.dynamicTimers.values()) {
         clearTimeout(timer)
      }
      this.dynamicTimers.clear()
   }

   start(recurringIntervalSec = 15) {
      this._startDynamicTasks()
      const runRecurringTasks = () => this._checkPremiumAndRent()
      runRecurringTasks()
      this.recurringIntervalId = setInterval(runRecurringTasks, recurringIntervalSec * 1000)
      if (this.verbose) this._log(`Recurring scheduler started, running every ${recurringIntervalSec} second(s).`)
   }

   stop() {
      this._clearDynamicTimers()
      if (this.recurringIntervalId) {
         clearInterval(this.recurringIntervalId)
         this.recurringIntervalId = null
      }
      if (this.verbose) this._log('All scheduled tasks have been stopped.')
   }

   reloadDynamicTasks() {
      if (this.verbose) this._log('Reloading dynamic tasks from database...')
      this._startDynamicTasks()
   }
}