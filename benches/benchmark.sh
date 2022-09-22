#!/bin/bash

yarn tsc \
  --module commonjs \
  --target esnext \
  --esModuleInterop \
  ./benches/**/*.ts

echo '-------------------'
echo 'extra-ecs'
echo '-------------------'
node --expose-gc ./benches/extra-ecs/benchmark.js

rm ./benches/**/*.js
