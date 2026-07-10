# BIG UPDATES HISTORY

1. Bot Hosting (13/01/2025) - Finish
2. RPG Games (20/04/2025) - Finish
3. WhatsApp Gateway Intregared (14/06/2025) - Finish
4. Migration from CJS to ESM (28/09/2025) - Finish
5. Proxy DB Integration (10/04/2026)

# DATABASE ADVANCE METHOD

```Javascript
// .all() --- Get all data entry from the array
=> global.db.users.all()

// .get() --- Find a single data entry from the array by jid, lid, id, or _id
=> global.db.users.get(jid)

// .delete() --- Delete a single data entry from the array by jid, lid, id, or _id
=> global.db.users.delete(jid)

// .drop() --- Drops a collection of object or array data
=> global.db.users.drop() // --- Array
=> global.db.statstic.drop() // --- Object

// Chainable Method
=> global.db.bots(jid)?.data?.users.get(jid)

```

> [!IMPORTANT]
> To add new data to global.db (e.g., global.db.reports), add data structure in the structure() block method in [models.js.](https://github.com/neoxrjs/v5.1-optima/blob/a5b88906d1ffffa8610fbbcd84fb957e1bf649b9/lib/system/models.js#L216)

# TROUBLESHOOTING (BAILEYS)

If you encounter issues or get stuck using ```npm:neoxr/baileys```, consider using one of the alternative Baileys packages listed below.

─ All fixed and more advance features modified by [@itsliaaa](https://github.com/itsliaaa) **(Stable)** ~ [Documentation](https://www.npmjs.com/package/@itsliaaa/baileys)

```JSON
"baileys": "npm:@itsliaaa/baileys"
```

─ Fix connection modified by [@MichelleBot](https://github.com/MichelleBot) **(Stable)** ~ [Documentation](https://github.com/MichelleBot/baileys/blob/master/README.md)

```JSON
"baileys": "git+https://github.com/MichelleBot/baileys.git"
```

─ Only add StickerPack function and overhaul resource usage on connection. **(Experiment Only :v)**

```JSON
"baileys": "git+https://github.com/neoxr/baileys.git"
```

─ Original Baileys by [@WhiskeySockets](https://github.com/whiskeySockets/Baileys.git)

```JSON
"baileys": "git+https://github.com/whiskeySockets/Baileys.git"
```

**Note :**

All of the Baileys versions above have an issue where they cannot send media to Group Status (SWGC) and Channel (Newsletter).

**Reference to the issue :**

- [[BUG] GroupStatus Not Working #2439
](https://github.com/WhiskeySockets/Baileys/issues/2439)
- [[BUG] SENT MEDIA TO NEWSLETTER / CHANNEL DOEST WORK #2322](https://github.com/WhiskeySockets/Baileys/issues/2322)
- [[BUG] Can't send media to Channel / Newsletter](https://github.com/WhiskeySockets/Baileys/issues/2341)
- [[BUG] Channels no longer show media sent using baileys #2086](https://github.com/WhiskeySockets/Baileys/issues/2086)

# DOCUMENTATION

> Here : [ID](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/ID.md) | [EN](https://github.com/neoxr/v5.1-optima/blob/5.1-ESM/EN.md)