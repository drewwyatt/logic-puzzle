import invariant from 'tiny-invariant'
import type { Category, Option } from './category'

type Relationships = Record<string, Option[]>
export class Graph {
  #self: Option
  #relationships: Relationships

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

  is = (option: Option, flagback: boolean) => {
    const idx = this.#relationships[option.category.id].indexOf(option)
    invariant(
      idx !== -1,
      `[${this.#self.id}][is] option "${option.id}" is impossible
found: [${this.#relationships[option.category.id].map(o => o.id).join(', ')}].
    `,
    )

    if (flagback) {
      option.is(this.#self, false)

      for (const opt of this.#relationships[option.category.id]) {
        if (opt !== option) {
          opt.not(this.#self, false)
        }
      }
    }

    this.#relationships[option.category.id] = [option]
  }

  not = (option: Option, flagback: boolean) => {
    this.#relationships[option.category.id] = this.#relationships[
      option.category.id
    ].filter(opt => opt !== option)

    if (flagback) {
      option.not(this.#self, false)
    }
  }
}
