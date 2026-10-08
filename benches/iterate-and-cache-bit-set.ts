import { Benchmark } from 'extra-benchmark'
import { BitSet } from '@blackglory/structures'

const benchmark = new Benchmark('Iterate and cache BitSet', {
  warms: 1000
, runs: 10000
})

benchmark.addCase('Array.from(BitSet) then iterate', () => {
  const set = new BitSet()
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    const cache = Array.from(set)

    for (const x of cache) {
      x
    }
  }
})

benchmark.addCase('Iterate with caching', () => {
  const set = new BitSet()
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    for (const x of iterate()) {
      x
    }
  }

  function* iterate(): IterableIterator<number> {
    const cache: number[] = new Array(set.size)

    let i = 0
    for (const value of set.values()) {
      yield value
      cache[i++] = value
    }
  }
})

for await (const result of benchmark.run()) {
  console.log(result)
}
