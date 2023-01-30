import { beforeEach, describe, expect, it } from '@jest/globals'
import { Category, KnownCategory, Option } from './models'

// 1. genres.country.not(orders.fourth)
//
// 2. genres.folk.is(songTitles.whatWeNeed)
//
// 3. genres.blueGrass.either(bandNames.blissIron, bandNames.abacus)
// 3. songTitles.vanityPlates.either(bandNames.blissOrin, bandNames.abacus)
//
// 4. bandNames.blissIron.not(songTitles.whatWeNeed)
// 4. bandNames.blissIron.not(orders.third)
// 4. songTitles.whatWeNeed.not(orders.third)

const bandNameIds = ['abacus', 'blissIron', 'manicAndroid', 'silverBlue'] as const
const genreIds = ['blueGrass', 'country', 'folk', 'techno'] as const
const orderIds = ['first', 'second', 'third', 'fourth'] as const
const songTitleIds = [
  'anythingElse',
  'iThinkOfYou',
  'vanityPlates',
  'whatWeNeed',
] as const

let bandNames: KnownCategory<typeof bandNameIds>
let genres: KnownCategory<typeof genreIds>
let orders: KnownCategory<typeof orderIds>
let songTitles: KnownCategory<typeof songTitleIds>
let categories: Category[]

beforeEach(() => {
  bandNames = Category.From('bandName', bandNameIds)
  genres = Category.From('genre', genreIds)
  orders = Category.From('order', orderIds)
  songTitles = Category.From('songTitle', songTitleIds)

  categories = [bandNames, genres, orders, songTitles]

  for (const category of categories) {
    category.link(categories)
  }
})

describe('Basic Setup', () => {
  it('Creates categories without errors', () => {
    expect(bandNames instanceof Category).toEqual(true)
    expect(genres instanceof Category).toEqual(true)
    expect(songTitles instanceof Category).toEqual(true)
  })

  it('Allows options to be accessed through names properties', () => {
    expect(bandNames.abacus instanceof Option).toEqual(true)
    expect(bandNames.blissIron instanceof Option).toEqual(true)
    expect(bandNames.manicAndroid instanceof Option).toEqual(true)
    expect(bandNames.silverBlue instanceof Option).toEqual(true)
  })
})

describe('Filtering Possibilities', () => {
  it('Returns all category options before any filtering', () => {
    expect(genres.country.possibilities(orders)).toEqual(orders.options)
    expect(orders.fourth.possibilities(genres)).toEqual(genres.options)
  })

  it('Removes the options from both sets of possibilities when using "not"', () => {
    genres.country.not(orders.fourth)

    expect(genres.country.possibilities(orders)).toEqual(
      orders.options.filter(opt => opt !== orders.fourth),
    )
    expect(orders.fourth.possibilities(genres)).toEqual(
      genres.options.filter(opt => opt !== genres.country),
    )
  })

  it('Returns null answer when there are multiple possibilities', () => {
    expect(genres.folk.getAnswer(songTitles)).toBeNull()
    expect(songTitles.whatWeNeed.getAnswer(genres)).toBeNull()
  })

  it('Returns the option when there is only one possibility', () => {
    genres.folk.is(songTitles.whatWeNeed)

    expect(genres.folk.getAnswer(songTitles)).toBe(songTitles.whatWeNeed)
    expect(songTitles.whatWeNeed.getAnswer(genres)).toBe(genres.folk)
  })

  it('Daisy-chains previously known information', () => {
    genres.blueGrass.is(orders.first)
    genres.blueGrass.is(songTitles.vanityPlates)

    expect(orders.first.getAnswer(songTitles)).toEqual(songTitles.vanityPlates)
  })
})
