import { readCachedValue, writeCachedValue } from '../storage/geocoderCache'
import type { Place, PlacePhoto } from '../types/domain'

type WikimediaMetadata = {
  ImageDescription?: { value?: string }
  Artist?: { value?: string }
  DateTimeOriginal?: { value?: string }
}

type WikimediaPage = {
  pageid?: number
  title?: string
  imageinfo?: Array<{
    thumburl?: string
    url?: string
    descriptionurl?: string
    extmetadata?: WikimediaMetadata
  }>
}

type WikimediaResponse = {
  query?: { pages?: Record<string, WikimediaPage> }
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

function cacheKey(place: Place) {
  return `photos:${place.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim()}:${place.coordinates.map((coordinate) => coordinate.toFixed(3)).join(':')}`
}

function cleanHtml(value?: string) {
  const cleaned = value?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned ? cleaned.slice(0, 500) : undefined
}

export async function fetchPlacePhotos(place: Place, force = false): Promise<{ photos: PlacePhoto[]; cached: boolean }> {
  const key = cacheKey(place)
  if (!force) {
    const cached = await readCachedValue<PlacePhoto[]>(key)
    if (cached) return { photos: cached, cached: true }
  }

  const [longitude, latitude] = place.coordinates
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggsprimary: 'all',
    ggsnamespace: '6',
    ggsradius: '1000',
    ggslimit: '8',
    ggscoord: `${latitude}|${longitude}`,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '640',
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
  if (!response.ok) throw new Error(`Wikimedia Commons returned HTTP ${response.status}`)
  const payload = await response.json() as WikimediaResponse
  const photos = Object.values(payload.query?.pages ?? {}).flatMap((page): PlacePhoto[] => {
    const info = page.imageinfo?.[0]
    if (!page.pageid || !page.title || !info?.thumburl || !info.url || !info.descriptionurl) return []
    const metadata = info.extmetadata
    return [{
      id: String(page.pageid),
      title: page.title.replace(/^File:/, ''),
      description: cleanHtml(metadata?.ImageDescription?.value),
      author: cleanHtml(metadata?.Artist?.value),
      publishedAt: metadata?.DateTimeOriginal?.value,
      imageUrl: info.url,
      thumbnailUrl: info.thumburl,
      sourceUrl: info.descriptionurl,
      source: 'wikimedia-commons',
    }]
  })
  await writeCachedValue(key, photos, Date.now() + CACHE_TTL)
  return { photos, cached: false }
}
