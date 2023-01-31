import invariant from 'tiny-invariant'

export type Clue = string

export type AnyCategory = { _: Category } | Category
const getCategory = (category: AnyCategory): Category =>
  category instanceof Category ? category : category._

type Relationships = Record<string, Option[]>
class Graph {
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

export class Option {
  id: string
  category: Category
  #graph?: Graph

  constructor(id: string, category: Category) {
    this.id = id
    this.category = category
  }

  link = (categories: Category[]) => {
    this.#graph = new Graph(this, categories)
  }

  getAnswer = (category: AnyCategory): Option | null =>
    this.#graph!.getAnswer(getCategory(category))
  possibilities = (category: AnyCategory): Option[] =>
    this.#graph!.possibilities(getCategory(category))
  is = (option: Option, flagback: boolean = true) => this.#graph!.is(option, flagback)
  not = (option: Option, flagback: boolean = true) => this.#graph!.not(option, flagback)
}

export type KnownCategory<T extends string[] | readonly string[]> = {
  [key in T[number]]: Option
} & { _: Category }

export class Category {
  id: string
  options: Option[]

  private constructor(id: string, options: readonly string[]) {
    this.id = id
    this.options = options.map(config => new Option(config, this))
  }

  static From = <T extends string[] | readonly string[]>(
    id: string,
    options: T,
  ): KnownCategory<T> => {
    const category = {
      _: new Category(id, options),
    } as KnownCategory<T>

    for (const option of options) {
      ;(category as any)[option] = category._.get(option)
    }

    return category
  }

  private get = (id: string): Option => {
    const option = this.options.find(o => o.id === id)
    invariant(option, `[${this.id}] No option for id: "${id}"`)

    return option
  }

  link = (categories: AnyCategory[]) => {
    const linkableCategories = categories.map(getCategory).filter(c => c != this)
    for (const option of this.options) {
      option.link(linkableCategories)
    }
  }
}
