const split = require('split2')
const parseJson = require('fast-json-parse')
const fastJson = require('fast-json-stringify')
const pumpify = require('pumpify')

const stringifyJson = fastJson({
  type: 'object',
  properties: {
    time: { type: 'string' },
    hostname: { type: 'string' },
    level: { type: 'integer' },
    msg: { type: 'string' },
    pid: { type: 'integer' },
    req: { type: 'object', additionalProperties: true },
    res: { type: 'object', additionalProperties: true },
    responseTime: { type: 'integer' },
    v: { type: 'integer' },
    severity: { type: 'string' }
  }
})

function pinoStackdriver (line) {
  const { value } = parseJson(line)
  if (value) {
    switch (value.level) {
      case 10: value.severity = 'DEBUG'; break
      case 20: value.severity = 'DEBUG'; break
      case 40: value.severity = 'WARNING'; break
      case 50: value.severity = 'ERROR'; break
      case 60: value.severity = 'CRITICAL'; break
      default: value.severity = 'INFO'
    }
    if (value.time) {
      value.time = new Date(value.time).toISOString()
    }
    line = value.req ? stringifyJson(value) : JSON.stringify(value)
  }
  return line + '\n'
}

const transform = split(pinoStackdriver)

function createStream () {
  return pumpify(transform, process.stdout)
}

module.exports.transform = transform
module.exports.createStream = createStream
