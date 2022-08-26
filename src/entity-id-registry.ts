import { isUndefined } from '@blackglory/prelude'
import { first } from 'iterable-operator'
import { EntityId } from './entity-id'

export class EntityIdRegistry {
  private nextEntityId: EntityId = 0
  private removedEntityIds: Set<number> = new Set()

  ;* getAllEntityIds(): Iterable<EntityId> {
    for (let entityId = 0; entityId < this.nextEntityId; entityId++) {
      if (!this.removedEntityIds.has(entityId)) {
        yield entityId
      }
    }
  }

  hasEntityId(entityId: EntityId): boolean {
    return entityId < this.nextEntityId
        && !this.removedEntityIds.has(entityId)
  }

  /**
   * entityId是entity的主键, 与数据库主键不同, 该键可以被重用.
   */
  createEntityId(): EntityId {
    const entityId = first(this.removedEntityIds)
    if (isUndefined(entityId)) {
      return this.nextEntityId++
    } else {
      this.removedEntityIds.delete(entityId)
      return entityId
    }
  }

  removeEntityId(entityId: EntityId): void {
    this.removedEntityIds.add(entityId)
  }
}
