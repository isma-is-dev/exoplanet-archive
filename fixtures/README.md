# Fixtures

Reference material used to understand and validate the NASA data model. Nothing
here is served at runtime: the API queries the live NASA Exoplanet Archive TAP
endpoint (`ps` table) and caches the result on disk.

## `nasa/PS_2026.03.28_02.51.33.csv`

An unmodified export of the NASA Exoplanet Archive **`ps` (Planetary Systems)**
table, taken 2026-03-28 02:51:33 UTC. 119 lines, ~25 kB, no personal data.

It is kept as a *data-model* reference: the column names are the ones the
transformer maps, and several fields in `apps/api/src/app/exoplanet/exoplanet.transformer.ts`
are explicitly `null` because this table does not provide them
(`pl_orbincl`, `disc_telescope`, `st_age`).

The `ps` table is the same one queried at runtime by the ADQL statement in
`ExoplanetService.loadData()`. The counts differ from production because the
live query adds `WHERE default_flag = 1` (one row per planet) and the archive
keeps growing.

Useful for anyone changing the transformer: check the column list here first.

```
head -1 nasa/PS_2026.03.28_02.51.33.csv | tr ',' '\n' | nl
```

To pull a fresh export:

```
curl -o nasa/PS_$(Get-Date -Format yyyy.MM.dd_HH.mm.ss).csv \
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?LANG=ADQL&FORMAT=csv&QUERY=SELECT+*+FROM+ps"
```
