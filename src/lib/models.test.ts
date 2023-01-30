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

const songTitleIds = [
  'anythingElse',
  'iThinkOfYou',
  'vanityPlates',
  'whatWeNeed',
] as const

let bandNames: KnownCategory<typeof bandNameIds>
let genres: KnownCategory<typeof genreIds>
let songTitles: KnownCategory<typeof songTitleIds>
let categories: Category[]

beforeEach(() => {
  bandNames = Category.From('bandName', bandNameIds)
  genres = Category.From('genre', genreIds)
  songTitles = Category.From('songTitle', songTitleIds)
  categories = [bandNames, genres, songTitles]

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
