import { NonEmptyArray } from '@blackglory/prelude'
import { MapProps } from 'hotypes'
import { StructureOfArrays, Structure, StructurePrimitive } from 'structure-of-arrays'
import { World } from './world'
import { Component } from './component'

export class Entity {
  constructor(
    private readonly world: World
  , public readonly id: number = world.createEntityId()
  ) {}

  exists(): boolean {
    return this.world.hasEntityId(this.id)
  }

  remove(): void {
    this.world.removeEntityId(this.id)
  }

  getAllComponents(): Iterable<Component> {
    return this.world.getComponents(this.id)
  }

  componentsExist<T extends NonEmptyArray<Component>>(
    ...components: T
  ): MapProps<T, boolean> {
    return this.world.componentsExist(this.id, ...components)
  }

  addComponents<T extends Structure>(
    ...componentValuePairs: NonEmptyArray<
      [component: StructureOfArrays<T>, value: StructurePrimitive<T>]
    >
  ): void {
    this.world.addComponents(this.id, ...componentValuePairs)
  }

  removeComponents<T extends Structure>(
    ...components: NonEmptyArray<Component<T>>
  ): void {
    this.world.removeComponents(this.id, ...components)
  }
}
