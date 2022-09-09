import { go } from '@blackglory/prelude'
import { addRemove } from './add-remove'
import { entityCycle } from './entity-cycle'
import { fragIter } from './frag-iter'
import { packed5 } from './packed-5'
import { simpleIter } from './simple-iter'
import { Benchmark } from 'extra-benchmark'

const benchmark = new Benchmark('extra-ecs', {
  warmUps: 1000
, runs: 5000
})

benchmark.addCase('packed_5', () => {
  return packed5(1000)
})

benchmark.addCase('simple_iter', () => {
  return simpleIter(1000)
})

benchmark.addCase('frage_iter', () => {
  return fragIter(100)
})

benchmark.addCase('entity_cycle', () => {
  return entityCycle(1000)
})

benchmark.addCase('add_remove', () => {
  return addRemove(1000)
})

go(async () => {
  for await (const result of benchmark.run()) {
    console.log(result)
  }
})
