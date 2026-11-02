import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_MAP_VIEWPORT, getInitialMapViewport } from '../src/components/mapViewport'
import { deduplicatePlaces, searchLocalPlaces } from '../src/providers/localPlaceIndex'
import { buildJourneyContext } from '../src/providers/context'
import { weatherLabel } from '../src/providers/weather'
import { journeyJson, parseJourneyJson } from '../src/storage/journeyTransfer'
import type { Place } from '../src/types/domain'

const place = (id: string, name: string, category?: string): Place => ({ id, name, category, coordinates: [2.35, 48.85], source: 'map' })

test('local search ranks prefix matches and requires all terms', () => {
  const results = searchLocalPlaces([place('1', 'Central Station', 'transport'), place('2', 'Station Road', 'road'), place('3', 'Museum')], 'central station')
  assert.deepEqual(results.map((item) => item.id), ['1'])
})

test('place indexing removes duplicate feature ids', () => {
  assert.equal(deduplicatePlaces([place('same', 'One'), place('same', 'Replacement'), place('other', 'Two')]).length, 2)
})

test('initial map viewport restores free exploration and prioritizes a selected destination', () => {
  const savedViewport = { center: [-73.9857, 40.7484] as [number, number], zoom: 12.25 }
  assert.deepEqual(getInitialMapViewport(null, savedViewport), savedViewport)
  assert.deepEqual(getInitialMapViewport(null, null), DEFAULT_MAP_VIEWPORT)
  assert.deepEqual(getInitialMapViewport(place('destination', 'Destination'), savedViewport), { center: [2.35, 48.85], zoom: 14 })
})

test('weather codes map to readable condition labels', () => {
  assert.equal(weatherLabel(0), 'Clear sky')
  assert.equal(weatherLabel(61), 'Rain')
  assert.equal(weatherLabel(95), 'Thunderstorm')
})

test('photo metadata is included as untrusted text context without image content', () => {
  const messages = buildJourneyContext({
    settings: {
      llmProvider: 'ollama',
      llmBaseUrl: 'http://localhost:11434/v1',
      llmModel: 'test',
      llmApiKey: '',
      personaName: 'Guide',
      personaInstructions: '',
      onlineGeocoder: 'nominatim',
      calculateWalkingRoutes: false,
      routingBaseUrl: 'https://router.project-osrm.org',
      liveDataEnabled: false,
      weatherBaseUrl: 'https://api.open-meteo.com/v1/forecast',
    },
    selectedPlace: place('place', 'Test Place'),
    journey: { destinationHistory: [], currentScene: 1, knownPeople: [], knownEntities: [], userFacts: [], conversationSummary: '' },
    messages: ['starter'],
    userMessage: 'What is this place like?',
    destinationPhotos: [{
      id: '1',
      title: 'Town square',
      description: 'A market beside the old hall.',
      imageUrl: 'https://example.test/full.jpg',
      thumbnailUrl: 'https://example.test/thumb.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Town_square.jpg',
      source: 'wikimedia-commons',
    }],
  })
  assert.match(messages[0].content, /Town square/)
  assert.match(messages[0].content, /untrusted text/)
  assert.doesNotMatch(messages[0].content, /full\.jpg/)
})

test('journey export round-trips and rejects malformed data', () => {
  const journey = {
    id: 'active' as const,
    currentDestination: place('current', 'Current'),
    mapViewport: null,
    destinationHistory: [place('current', 'Current')],
    currentScene: 2,
    messages: ['hello'],
    knownPeople: ['Ada'],
    knownEntities: [],
    userFacts: ['A fact'],
    narrativeEvents: [],
    conversationSummary: '',
  }
  assert.deepEqual(parseJourneyJson(JSON.parse(journeyJson(journey))), JSON.parse(JSON.stringify(journey)))
  assert.throws(() => parseJourneyJson({ id: 'wrong' }), /invalid id/)
})
