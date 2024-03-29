import { PubSub } from 'graphql-subscriptions'

export class SubscriptionService {
  private _pubSub = new PubSub()

  publish<T>(channelId: string, data: T) {
    this._pubSub.publish(channelId, data)
  }

  createChannelId(channelName: string, id?: string): ChannelName {
    if (!id) {
      return channelName
    }

    return `${channelName}_${id}`
  }

  get pubsub() {
    if (this._pubSub) {
      return this._pubSub
    }

    return null
  }
}

type ID = string | number
type ChannelName = `${string}_${ID}` | string
