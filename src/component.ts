import { StructureOfArrays, Structure } from 'structure-of-arrays'
import { isntUndefined } from '@blackglory/prelude'

export type Component<T extends Structure = any> = StructureOfArrays<T>

export class ComponentRegistry {
  private nextId: number = 0
  private idToComponent: Component[] = []
  private componentToId: Map<Component, number> = new Map()

  getId(component: Component): number {
    const id = this.componentToId.get(component)
    if (isntUndefined(id)) {
      return id
    } else {
      const id = this.createId()
      this.componentToId.set(component, id)
      this.idToComponent[id] = component
      return id
    }
  }

  getComponent(id: number): Component | undefined {
    return this.idToComponent[id]
  }

  private createId(): number {
    return this.nextId++
  }
}
