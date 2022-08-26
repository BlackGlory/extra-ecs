import { Structure } from 'structure-of-arrays'
import { isUndefined } from '@blackglory/prelude'
import { Component, ComponentId } from './component'

export class ComponentRegistry {
  private nextExponential: ComponentId = 0n
  private componentIdToComponent: Map<ComponentId, Component> = new Map()
  private componentToComponentId: Map<Component, ComponentId> = new Map()

  getComponentId(component: Component): ComponentId {
    const id = this.componentToComponentId.get(component)
    if (isUndefined(id)) {
      const id = this._createId()
      this.componentToComponentId.set(component, id)
      this.componentIdToComponent.set(id, component)
      return id
    } else {
      return id
    }
  }

  getComponent<T extends Structure>(id: ComponentId): Component<T> | undefined {
    return this.componentIdToComponent.get(id)
  }

  _createId(): ComponentId {
    return 1n << this.nextExponential++
  }
}
