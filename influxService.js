// influxService.js
import { queryApi, writeApi, config } from './influxConfig'
import { Point } from '@influxdata/influxdb-client'

// 📥 Legge i dati dei sensori
export async function getSensorData() {
  const query = `
    from(bucket: "${config.bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "misurazioni")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
  `

  const result = []

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        result.push(tableMeta.toObject(row))
      },
      error: reject,
      complete: () => resolve(result)
    })
  })
}

// ⚙️ Invia un’azione manuale al database (es. modifica di un valore)
export async function sendManualAction(sensorName = "temperaturaC", percent = 3) {
  try {
    const query = `
      from(bucket: "${config.bucket}")
        |> range(start: -10m)
        |> filter(fn: (r) => r._measurement == "misurazioni")
        |> filter(fn: (r) => r._field == "${sensorName}")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 1)
    `

    const result = []
    await new Promise((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          result.push(tableMeta.toObject(row))
        },
        error: reject,
        complete: resolve
      })
    })

    if (result.length === 0) throw new Error(`Nessun dato trovato per ${sensorName}`)

    const lastValue = result[0]._value
    const newValue = lastValue * (1 + percent / 100)

    const point = new Point("misurazioni").floatField(sensorName, newValue)
    writeApi.writePoint(point)
    await writeApi.close()

    console.log(`✅ ${sensorName} aggiornato a ${newValue.toFixed(2)}`)
    return newValue
  } catch (error) {
    console.error("❌ Errore in sendManualAction:", error)
    throw error
  }
}
