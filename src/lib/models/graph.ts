import invariant from 'tiny-invariant'
import type { Category, Option } from './category'

class TokenStore {
  maxSize = 10 // 🤷
  #store: Symbol[] = []

  get size(): number {
    return this.#store.length
  }

  tryAdd = (token: Symbol) => {
    if (!this.#includes(token)) {
      this.#push(token)
      return true
    }

    return false
  }

  #push = (token: Symbol) => {
    this.#store.push(token)
    if (this.#store.length >= this.maxSize) {
      this.#store.shift()
    }
  }

  #includes = (token: Symbol): boolean => this.#store.indexOf(token) > -1
}

type Relationships = Record<string, Option[]>
export class Graph {
  #self: Option
  #relationships: Relationships
  #tokenStore = new TokenStore()

  constructor(self: Option, categories: Category[]) {
    this.#self = self
    this.#relationships = {}
    for (const category of categories) {
      this.#relationships[category.id] = category.options
    }
  }

  getAnswer = (category: Category): Option | null => {
    const possibilities = this.#relationships[category.id]
    return possibilities.length === 1 ? possibilities[0] : null
  }

  possibilities = (category: Category) => this.#relationships[category.id]

  is = (option: Option, token: Symbol) => {
    const idx = this.#relationships[option.category.id].indexOf(option)
    invariant(
      idx !== -1,
      `[${this.#self.id}][is] option "${option.id}" is impossible
found: [${this.#relationships[option.category.id].map(o => o.id).join(', ')}].
    `,
    )

    if (this.#tokenStore.tryAdd(token)) {
      option.is(this.#self, token)

      for (const opt of this.#relationships[option.category.id]) {
        if (opt !== option) {
          opt.not(this.#self, token)
        }
      }
    }

    this.#relationships[option.category.id] = [option]
  }

  not = (option: Option, token: Symbol) => {
    this.#relationships[option.category.id] = this.#relationships[
      option.category.id
    ].filter(opt => opt !== option)

    if (this.#tokenStore.tryAdd(token)) {
      option.not(this.#self, token)
    }
  }
}
