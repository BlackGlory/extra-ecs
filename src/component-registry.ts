import { isUndefined } from '@blackglory/prelude'
import { Component, ComponentId } from './component'

export class ComponentRegistry {
  private nextComponentId: ComponentId = 0
  private idToComponent: Map<ComponentId, Component> = new Map()
  private componentToId: Map<Component, ComponentId> = new Map()

  getComponentId(component: Component): ComponentId {
    const id = this.componentToId.get(component)
    if (isUndefined(id)) {
      const id = this._createId()
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

  _createId(): ComponentId {
    return this.nextComponentId++
  }
}
