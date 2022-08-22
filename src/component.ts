import { StructureOfArrays, Structure } from 'structure-of-arrays'
import { isUndefined } from '@blackglory/prelude'

export type Component<T extends Structure = any> = StructureOfArrays<T>

export class ComponentRegistry {
  private nextId: number = 0
  private idToComponent: Map<number, Component> = new Map()
  private componentToId: Map<Component, number> = new Map()

  getId(component: Component): number {
    const id = this.componentToId.get(component)
    if (isUndefined(id)) {
      const id = this.createId()
      this.componentToId.set(component, id)
      this.idToComponent.set(id, component)
      return id
    } else {
      return id
    }
  }

  getComponent(id: number): Component | undefined {
    return this.idToComponent.get(id)
  }

  private createId(): number {
    return 2 ** this.nextId++
  }
}
