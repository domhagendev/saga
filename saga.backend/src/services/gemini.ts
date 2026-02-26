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
 * Gemini 2.0 Flash — fast model for page generation, autocomplete, JSON extraction.
 */
export function getFlashModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })
}

/**
 * Gemini 1.5 Pro — reasoning model for world logic validation, deep analysis.
 */
export function getProModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: 'gemini-1.5-pro' })
}
