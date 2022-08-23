import { StructureOfArrays, Structure } from 'structure-of-arrays'
import { isUndefined } from '@blackglory/prelude'

export type Component<T extends Structure = any> =
| StructureOfArrays<T>
| symbol

export type ComponentId = bigint

export class ComponentRegistry {
  private nextExponential: ComponentId = 0n
  private idToComponent: Map<ComponentId, Component> = new Map()
  private componentToId: Map<Component, ComponentId> = new Map()

  getId(component: Component): ComponentId {
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

  getComponent(id: ComponentId): Component | undefined {
    return this.idToComponent.get(id)
  }

  private createId(): ComponentId {
    return 1n << this.nextExponential++
  }
}
