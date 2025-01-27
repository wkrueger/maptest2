/**
 * @private
 * @param {number} nr
 * @param {number} byte
 */
function getBit(nr, byte) {
  let bt = (nr >> byte) & 1
  return bt
}

/**
 * @param {number[]} src
 */
function getInt(src) {
  let out = 0
  for (let x = 0; x < src.length; x++) {
    const bit = src[x]
    if (bit) out += 2 ** x
  }
  return out
}

/**
 * @private
 * @param {Buffer} src
 */
function gpkgStripHeader(src) {
  // magic: 0 - 1
  // version: 2
  // flags: 3
  // srsid: 4 - 35
  // envelope: variable
  const flags = src[3]
  let bits = [...Array(8).keys()].map(x => getBit(flags, x)).reverse()
  let slice = bits.slice(4, 7).reverse()
  let contents = getInt(slice)
  const sizemap = {
    0: 0,
    1: 32,
    2: 48,
    3: 48,
    4: 64,
  }
  const envsize = sizemap[contents]
  return src.slice(8 + envsize)
}

export { gpkgStripHeader }
