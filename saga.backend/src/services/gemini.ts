import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''

let genAI: GoogleGenerativeAI | undefined

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

/**
 * Gemini 3 Flash — fast model for page generation, autocomplete, JSON extraction.
 */
export function getFlashModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: 'gemini-3-flash-preview' })
}

/**
 * Gemini 3 Flash — reasoning model for world logic validation, deep analysis.
 * Note: gemini-3-pro-preview has no free-tier quota; using Flash as fallback.
 */
export function getProModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: 'gemini-3-flash-preview' })
}
