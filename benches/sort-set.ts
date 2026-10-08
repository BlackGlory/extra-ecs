import { Benchmark } from 'extra-benchmark'
import { CleanSparseSet, BitSet, SortedSet } from '@blackglory/structures'
import { compareNumbersAscending } from 'extra-sort'

const benchmark = new Benchmark('Sort Set', { 
  warms: 1000
, runs: 10000
})

benchmark.addCase('Array.from(SparseSet).sort()', () => {
  const set = new CleanSparseSet()
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    for (const x of Array.from(set).sort(compareNumbersAscending)) {
      x
    }
  }
})

benchmark.addCase('Array.from(SparseSet).toSorted()', () => {
  const set = new CleanSparseSet()
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    for (const x of Array.from(set).toSorted(compareNumbersAscending)) {
      x
    }
  }
})

benchmark.addCase('BitSet#values()', () => {
  const set = new BitSet()
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    for (const x of set.values()) {
      x
    }
  }
})

benchmark.addCase('SortedSet#value()', () => {
  const set = new SortedSet<number>(compareNumbersAscending)
  for (let i = 0; i < 100000; i += 4) {
    set.add(i)
  }

  return () => {
    for (const x of set.values()) {
      x
    }
  }
})

for await (const result of benchmark.run()) {
  console.log(result)
}
