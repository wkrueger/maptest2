import Fastify from "fastify"
import fstatic from "@fastify/static"
import pathMod from "path"
import wkx from "wkx"
import sqlite from "better-sqlite3"
import { gpkgStripHeader } from "./gpkgStripHeader.js"

const PORT = 3000

const app = Fastify({ logger: true })

app.register(fstatic, {
  root: pathMod.resolve("./static"),
  prefix: "/static",
})

app.get("/geom", async (request, reply) => {
  const p = pathMod.resolve(".", "static", "sc_municipios.gpkg")
  const conn = new sqlite(pathMod.resolve(".", "static", "sc_municipios.gpkg"))
  const tableName = "municipios_simp"
  const cursor = conn.prepare(`SELECT * FROM ${tableName}`)
  const allIt = cursor.all()
  const allRows = []
  for (const row of allIt) {
    const geomUint = row.geom
    const geomBuffer = Buffer.from(geomUint)
    const stripped = gpkgStripHeader(geomBuffer)
    const geoJson = wkx.Geometry.parse(stripped).toGeoJSON()
    const { geom, ...properties } = row
    allRows.push({
      ...geoJson,
      properties,
    })
  }
  return {
    type: "GeometryCollection",
    geometries: allRows,
  }
})

try {
  await app.listen({ port: PORT })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
