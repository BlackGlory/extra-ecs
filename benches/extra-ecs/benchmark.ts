import { addRemove } from './add-remove'
import { entityCycle } from './entity-cycle'
import { fragIter } from './frag-iter'
import { packed5 } from './packed-5'
import { simpleIter } from './simple-iter'

runBench(packed5, 1000)
runBench(simpleIter, 1000)
runBench(fragIter, 100)
runBench(entityCycle, 1000)
runBench(addRemove, 1000)

function runBench(fn: (count: number) => () => void, count: number): void {
  const nextFrame = fn(count)
  // pre-warm
  for (let i = 100; i--;) {
    nextFrame()
  }

  const startTime = process.hrtime.bigint()
  const oneSecond = 1000n * 1000n * 1000n
  let frames = 0
  let endTime = startTime
  while (endTime < startTime + oneSecond) {
    nextFrame()
    frames++
    endTime = process.hrtime.bigint()
  }
  const elapsedSeconds = Number(endTime - startTime) / 1000 / 1000 / 1000
  const framesPerSecond = Math.floor(frames / elapsedSeconds)
  console.log(`${fn.name}: ${framesPerSecond} fps`)
}
