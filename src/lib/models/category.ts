import invariant from 'tiny-invariant'
import { Graph } from './graph'

export type AnyCategory = { _: Category } | Category

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

const getCategory = (category: AnyCategory): Category =>
  category instanceof Category ? category : category._

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
