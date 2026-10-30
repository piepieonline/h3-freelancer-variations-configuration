# Dynamic extra locations in the generator

Mission Companion (`extra-destinations` branch) no longer hard-codes the extra freelancer destinations. `FreelancerVariations.json` now has to supply them in a top-level `extraDestinations` array, and the generator must output it.

## Target output

```json
{
  "patches": [ ... ],
  "extraDestinations": [
    {
      "travelReceiverId": "feed452b0ac243bc",
      "name": "Hawke's Bay",
      "mildContractId": "5e2d2784-1fb0-4006-8e0b-d7d907bae1b5",
      "hotContractId": "bdda4dc3-6af8-44b6-b4ca-09de1b5cb6fd",
      "scenePath": "assembly:/_pro/scenes/missions/sheep/scene_hex.entity"
    },
    {
      "travelReceiverId": "a021452b0ac243bc",
      "name": "Hantu Port",
      "mildContractId": "79afb4a5-bb4e-4dd4-a53e-d63b366e6c44",
      "hotContractId": "c2227b36-db89-4e79-bb1b-daf24a4b7117",
      "scenePath": "assembly:/_pro/scenes/missions/salty/scene_hantu_freelancer.entity",
      "destination": 23,
      "locationNames": {
        "city": "UI_LOCATION_PARENT_SALTY_CITY",
        "country": "UI_LOCATION_PARENT_SALTY_COUNTRY",
        "name": "UI_LOCATION_PARENT_SALTY_NAME"
      }
    }
  ],
  "configFileVersion": 1.14
}
```

Field rules, as the mod parses them:
- `travelReceiverId`: the travel receiver entity ID, as a hex string with no `0x` prefix.
- `name`: used only for logs and error messages.
- `mildContractId` / `hotContractId`: these are the IDs the mod swaps in when you travel to the destination. Each one **must** also have an entry in `patches`, or the mod reports a "no entry" error.
- `scenePath`: written into `/Contract/Metadata/ScenePath`.
- `destination` + `locationNames`: optional, and only needed for destinations the game doesn't already know (Hawke's Bay leaves them out). `destination` is the `EDestination` int. Each `locationNames` value is either a localisation key name, which the mod hashes with CRC32, or a raw hash written as a `"0x..."` string.
- If any field is missing or the wrong type, the mod rejects the whole file.

The full set the mod currently needs:

| travelReceiverId | name | mild | hot | scene | destination | city / country / name |
|---|---|---|---|---|---|---|
| feed452b0ac243bc | Hawke's Bay | 5e2d2784-1fb0-4006-8e0b-d7d907bae1b5 | bdda4dc3-6af8-44b6-b4ca-09de1b5cb6fd | sheep/scene_hex.entity | - | - |
| a021452b0ac243bc | Hantu Port | 79afb4a5-bb4e-4dd4-a53e-d63b366e6c44 | c2227b36-db89-4e79-bb1b-daf24a4b7117 | salty/scene_hantu_freelancer.entity | 23 | UI_LOCATION_PARENT_SALTY_CITY / _COUNTRY / _NAME |
| a022452b0ac243bc | Sierra Cantante | 2aacb6cd-3b8f-44e8-aacb-1d323e1e485a | c8c4d3b1-a9e5-40dc-a948-7e364d787ff5 | cuba/scene_cuba_freelancer.entity | 21 | UI_LOCATION_PARENT_CUBA_CITY / _COUNTRY / _NAME |
| a024452b0ac243bc | Carpathian Mountains | f128650c-96db-4a55-ab28-95bc2983687e | be9e444d-f58c-4c45-8d33-745dce403ef2 | trapped/scene_romania_freelancer.entity | 22 | 0xC2B4AFE7 / 0x61073D27 / UI_LOCATION_PARENT_TRAPPED_NAME |

(Every scene path above starts with `assembly:/_pro/scenes/missions/`.)

## Changes

1. **`missions.js`**
   - Add a new export, `extraDestinations`, holding the table above. It's static data, not something the user picks.
   - Add `missions` brick lists for the six new contract IDs: Hantu, Cuba and Romania, mild and hot. These contracts are made up for the mod and the game doesn't have them. For now they only exist in the hand-edited installed `FreelancerVariations.json`, so copy the brick lists from there.
   - Add `missionstoclear`, `missionvrtoreset` and `hardbricks` entries for the six IDs. Match what the installed JSON has; the Hawke's Bay entries are the model to follow.
   - Add the six IDs to `offbydefault` only if some of their bricks should start switched off.

2. **`friendlyNames.js`**
   - Add `guidToName` entries for the six IDs, e.g. "Hantu Port (Mild)".
   - Add `displayOrder` entries, probably grouped with Hawke's Bay.
   - Add `brickToVersion` entries so the new bricks show as "New".
   - Add `brickToName` / `brickToImage` entries for any brick not already listed (the `thefacility/*cuba*.brick` ones, for example).
   - Bump `currentFileVersion` to `1.14`, the version the installed file already uses.

3. **`index.js` → `generateOnline`**
   - Import `extraDestinations` and write it into the output between `patches` and `configFileVersion`, so the key order matches the hand-patched file.
   - Before exporting, make sure every extra destination still has an entry in `patches` for both its mild and hot ID. Every entry in `selectedMissions` is always emitted, so this only matters if mission entries are ever made optional.

4. **`index.js` → `loadExisting`**
   - No changes needed. It only reads `patches` and `configFileVersion`, and `extraDestinations` always comes from `missions.js`, so a loaded file's copy can be ignored.

5. **`generatePeacock`**
   - Out of scope, since the Peacock output format doesn't include destination data. Decide separately whether the six made-up contract IDs belong in that output.

## Open questions
- Should a user be able to turn an extra destination off? If so, add a checkbox per destination and leave that destination out of `extraDestinations`. The mod then won't redirect to it, and travelling there just plays the host contract (Ambrose).
- If Hantu / Cuba / Romania ever become normal destinations in the game, their `destination` + `locationNames` should be removed instead of being sent forever.
